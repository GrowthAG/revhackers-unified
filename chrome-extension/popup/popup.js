/**
 * RevHackers Clipper - Popup Script
 *
 * Gerencia o estado da UI do popup, incluindo:
 * - Fluxo de autenticacao (salvar/limpar JWT)
 * - Carregamento e selecao de projetos
 * - Controle de gravacao (start/stop) com timer
 * - Coleta de perfil LinkedIn na tab ativa
 * - Exibicao de mensagens de feedback
 */

const LOG_PREFIX = '[revhackers-ext]';

// ============================================================
// SUPABASE REST - busca projetos sem biblioteca externa
// ============================================================

// Importacao dinamica da config (popup nao tem acesso direto ao modulo background)
// Lemos as constantes via chrome.runtime para evitar duplicacao.
// Como popup.js nao e um modulo ES, usamos fetch direto com as constantes injetadas
// pelo popup.html que inclui este arquivo apos carregar.

// Fallback: URL hard-coded usada apenas para listar projetos (GET com anon key - seguro)
const SUPABASE_URL = 'https://eqspbruarsdybpfeijnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

// ============================================================
// ESTADO LOCAL
// ============================================================

let isRecording = false;
let recordingStartTime = null;
let timerInterval = null;
let currentTab = null;

// ============================================================
// REFERENCIAS AOS ELEMENTOS
// ============================================================

const authPanel    = document.getElementById('auth-panel');
const mainPanel    = document.getElementById('main-panel');
const footerAuth   = document.getElementById('footer-auth');
const footerEmail  = document.getElementById('footer-email');

const jwtInput     = document.getElementById('jwt-input');
const emailInput   = document.getElementById('email-input');
const loginBtn     = document.getElementById('login-btn');

const meetDot      = document.getElementById('meet-dot');
const meetStatusText = document.getElementById('meet-status-text');
const timerEl      = document.getElementById('timer');
const projectSelect = document.getElementById('project-select');
const recordBtn    = document.getElementById('record-btn');
const linkedinBtn  = document.getElementById('linkedin-btn');
const logoutBtn    = document.getElementById('logout-btn');
const statusMsgEls = document.querySelectorAll('#status-msg'); // podem haver 2 no DOM

// ============================================================
// UTILIDADES
// ============================================================

function showMsg(text, type = 'info') {
    // Aplica na primeira instancia visivel
    statusMsgEls.forEach(el => {
        el.textContent = text;
        el.style.display = text ? 'block' : 'none';
        el.className = type === 'success' ? 'success' : type === 'error' ? 'error' : '';
        el.id = 'status-msg'; // mantém o id
    });
}

function clearMsg() {
    showMsg('');
}

function sendToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.warn(`${LOG_PREFIX} sendMessage error:`, chrome.runtime.lastError.message);
                resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
                resolve(response || { success: false, error: 'Sem resposta do background' });
            }
        });
    });
}

// ============================================================
// TIMER DE GRAVACAO
// ============================================================

function startTimer() {
    if (timerInterval) return;
    timerEl.style.display = 'block';

    timerInterval = setInterval(() => {
        if (!recordingStartTime) return;
        const elapsed = Date.now() - recordingStartTime;
        const h = Math.floor(elapsed / 3600000);
        const m = Math.floor((elapsed % 3600000) / 60000);
        const s = Math.floor((elapsed % 60000) / 1000);
        timerEl.textContent =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerEl.style.display = 'none';
    timerEl.textContent = '00:00:00';
}

// ============================================================
// ATUALIZACAO DA UI DE GRAVACAO
// ============================================================

function updateRecordUI(recording) {
    isRecording = recording;

    if (recording) {
        meetDot.className = 'status-dot rec';
        meetStatusText.textContent = 'Gravando...';
        meetStatusText.className = 'status-text active';
        recordBtn.textContent = 'Parar Gravacao';
        recordBtn.classList.add('btn-stop');
        recordBtn.disabled = false;
        startTimer();
    } else {
        // Mantém o estado do Meet (ativo ou nao)
        const isMeet = currentTab?.url?.includes('meet.google.com');
        meetDot.className = isMeet ? 'status-dot meet' : 'status-dot';
        meetStatusText.textContent = isMeet ? 'Google Meet ativo' : 'Aguardando Google Meet...';
        meetStatusText.className = isMeet ? 'status-text active' : 'status-text';
        recordBtn.innerHTML = '<span class="btn-dot" style="background:#ef4444;"></span> Iniciar Gravacao';
        recordBtn.classList.remove('btn-stop');
        recordBtn.disabled = !isMeet;
        stopTimer();
    }
}

// ============================================================
// CARREGAMENTO DE PROJETOS (Supabase REST)
// Faz GET autenticado para listar projetos ativos.
// ============================================================

async function loadProjects(jwt) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rei_projects?select=id,client_id,status,diagnostic_data&order=created_at.desc&limit=30`,
            {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'apikey': SUPABASE_ANON_KEY,
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.warn(`${LOG_PREFIX} projects fetch status: ${response.status}`);
            return;
        }

        const projects = await response.json();
        console.log(`${LOG_PREFIX} loaded ${projects.length} projects`);

        // Recupera projeto previamente selecionado
        const stored = await new Promise(r => chrome.storage.local.get(['selectedProjectId'], r));
        const savedProjectId = stored.selectedProjectId || '';

        // Limpa opcoes anteriores (exceto placeholder)
        projectSelect.innerHTML = '<option value="">Selecione um projeto...</option>';

        for (const proj of projects) {
            const label = proj.diagnostic_data?.companyName
                || proj.diagnostic_data?.revops_empresa
                || proj.diagnostic_data?.projectName
                || `Projeto ${proj.id.substring(0, 8)}`;

            const opt = document.createElement('option');
            opt.value = proj.id;
            opt.textContent = `${label}${proj.status ? ' - ' + proj.status : ''}`;
            if (proj.id === savedProjectId) opt.selected = true;
            projectSelect.appendChild(opt);
        }

    } catch (err) {
        console.warn(`${LOG_PREFIX} loadProjects error:`, err.message);
    }
}

// ============================================================
// FLUXO DE AUTENTICACAO
// ============================================================

async function showAuth() {
    authPanel.style.display = 'block';
    mainPanel.style.display = 'none';
    footerAuth.style.display = 'none';
}

async function showMain(email) {
    authPanel.style.display = 'none';
    mainPanel.style.display = 'block';
    footerAuth.style.display = 'flex';
    footerEmail.textContent = email || 'autenticado';
}

loginBtn.addEventListener('click', async () => {
    const jwt = jwtInput.value.trim();
    const email = emailInput.value.trim();

    if (!jwt || jwt.length < 20) {
        showMsg('Cole um JWT valido antes de continuar.', 'error');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verificando...';

    const res = await sendToBackground({ type: 'SET_AUTH', jwt, email });

    if (res.success) {
        showMsg('Autenticado com sucesso.', 'success');
        setTimeout(async () => {
            clearMsg();
            await showMain(email);
            await loadProjects(jwt);
            await syncRecordingState();
        }, 800);
    } else {
        showMsg(res.error || 'Erro ao salvar token.', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});

logoutBtn.addEventListener('click', async () => {
    await sendToBackground({ type: 'CLEAR_AUTH' });
    await chrome.storage.local.remove(['selectedProjectId', 'selectedProjectName']);
    await showAuth();
});

// ============================================================
// SELECAO DE PROJETO
// ============================================================

projectSelect.addEventListener('change', () => {
    const projectId = projectSelect.value;
    const projectName = projectSelect.options[projectSelect.selectedIndex]?.text || '';

    sendToBackground({
        type: 'SET_PROJECT',
        projectId: projectId || null,
        projectName: projectId ? projectName : '',
    });

    console.log(`${LOG_PREFIX} project selected: ${projectId || 'none'}`);
});

// ============================================================
// GRAVACAO DE AUDIO (Meet)
// ============================================================

recordBtn.addEventListener('click', async () => {
    if (!currentTab) return;

    recordBtn.disabled = true;

    if (isRecording) {
        // PARAR
        recordBtn.textContent = 'Parando...';
        const res = await sendToBackground({ type: 'STOP_RECORDING' });

        if (res.success) {
            await chrome.storage.local.set({ isRecording: false, recordingStartTime: null });

            // Notifica content script
            try {
                await chrome.tabs.sendMessage(currentTab.id, { action: 'recordingStopped' });
            } catch (e) { /* tab pode estar fechada */ }

            updateRecordUI(false);
            showMsg('Gravacao encerrada. Enviando para transcricao...', 'success');
            setTimeout(clearMsg, 4000);
        } else {
            showMsg(res.error || 'Erro ao parar gravacao.', 'error');
            recordBtn.disabled = false;
        }

    } else {
        // INICIAR
        recordBtn.textContent = 'Iniciando...';
        const res = await sendToBackground({
            type: 'START_RECORDING',
            tabId: currentTab.id,
        });

        if (res.success) {
            recordingStartTime = Date.now();
            await chrome.storage.local.set({
                isRecording: true,
                recordingStartTime,
                recordingTabId: currentTab.id,
            });

            // Notifica content script
            try {
                await chrome.tabs.sendMessage(currentTab.id, { action: 'recordingStarted' });
            } catch (e) { /* ignorar */ }

            updateRecordUI(true);
            clearMsg();
        } else {
            showMsg(res.error || 'Erro ao iniciar gravacao.', 'error');
            recordBtn.disabled = false;
            updateRecordUI(false);
        }
    }
});

// ============================================================
// COLETA DO LINKEDIN
// ============================================================

linkedinBtn.addEventListener('click', async () => {
    if (!currentTab) return;

    linkedinBtn.disabled = true;
    linkedinBtn.textContent = 'Coletando...';

    try {
        // Executa a coleta diretamente no tab ativo via scripting API
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => {
                // Esta funcao roda no contexto do content script / pagina
                // Envia mensagem para o content-linkedin.js coletar e retornar os dados
                return new Promise((resolve) => {
                    // Tenta chamar a funcao exposta pelo content script
                    if (typeof window.__revhackersScrapeCurrent === 'function') {
                        resolve(window.__revhackersScrapeCurrent());
                    } else {
                        resolve(null);
                    }
                });
            },
        });

        if (result?.result) {
            // Dados coletados pelo content script - envia para background
            const res = await sendToBackground({
                type: 'LINKEDIN_SCRAPED',
                data: result.result,
            });

            if (res.success) {
                showMsg(`Perfil enviado: ${res.result?.fullName || 'OK'} | Score: ${res.result?.authorityScore ?? '-'}`, 'success');
            } else {
                showMsg(res.error || 'Erro ao enviar perfil.', 'error');
            }
        } else {
            // Content script nao expôs a funcao - aciona via message ao content script
            const res = await new Promise((resolve) => {
                chrome.tabs.sendMessage(
                    currentTab.id,
                    { action: 'SCRAPE_AND_SEND' },
                    (response) => resolve(response || { success: false, error: 'Sem resposta do content script' })
                );
            });

            if (res.success) {
                showMsg('Perfil coletado e enviado.', 'success');
            } else {
                showMsg(res.error || 'Nao foi possivel coletar o perfil. Certifique-se de estar em uma pagina de perfil LinkedIn.', 'error');
            }
        }

    } catch (err) {
        console.error(`${LOG_PREFIX} linkedin collect error:`, err.message);
        showMsg('Erro ao coletar perfil. Tente recarregar a pagina LinkedIn.', 'error');
    } finally {
        linkedinBtn.disabled = false;
        linkedinBtn.textContent = 'Coletar Perfil Atual';
    }
});

// ============================================================
// SINCRONIZA ESTADO DE GRAVACAO COM STORAGE
// ============================================================

async function syncRecordingState() {
    const stored = await new Promise(r =>
        chrome.storage.local.get(['isRecording', 'recordingStartTime', 'recordingState'], r)
    );

    const recording = stored.isRecording || stored.recordingState === 'recording';
    recordingStartTime = stored.recordingStartTime || null;

    updateRecordUI(recording);
}

// ============================================================
// INICIALIZACAO
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log(`${LOG_PREFIX} popup initialized`);

    // 1. Pega a tab ativa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab || null;

    // 2. Determina contexto da tab
    const isMeet     = currentTab?.url?.includes('meet.google.com');
    const isLinkedIn = currentTab?.url?.includes('linkedin.com/in/') ||
                       currentTab?.url?.includes('linkedin.com/company/');

    // 3. Verifica autenticacao
    const authRes = await sendToBackground({ type: 'GET_AUTH' });

    if (!authRes.isAuthenticated) {
        await showAuth();
        return;
    }

    // 4. Mostra painel principal
    await showMain(authRes.email);

    // 5. Configura botoes conforme contexto
    recordBtn.disabled   = !isMeet;
    linkedinBtn.disabled = !isLinkedIn;

    if (!isMeet && !isLinkedIn) {
        showMsg('Abra uma reuniao do Google Meet ou um perfil LinkedIn para usar a extensao.');
    }

    // 6. Carrega projetos
    await loadProjects(authRes.jwt);

    // 7. Sincroniza estado de gravacao
    await syncRecordingState();
});
