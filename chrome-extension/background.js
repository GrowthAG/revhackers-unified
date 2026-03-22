/**
 * RevHackers Clipper - Background Service Worker
 *
 * Responsabilidades:
 * - Gerenciar ciclo de vida da gravacao de audio (Meet)
 * - Receber dados de scraping do LinkedIn e enviar para a Edge Function
 * - Manter estado de projeto selecionado e JWT em chrome.storage.local
 * - Fazer upload do audio gravado para process-meeting-audio
 *
 * IMPORTANTE: Service Workers podem ser terminados a qualquer momento pelo Chrome.
 * Todo estado critico (projectId, JWT, estado de gravacao) deve ser persistido
 * via chrome.storage.local, nunca em variaveis globais.
 */

import { ENDPOINTS, SUPABASE_ANON_KEY } from './config.js';

const LOG_PREFIX = '[revhackers-ext]';

// ============================================================
// LISTENER CENTRAL DE MENSAGENS
// Todos os content scripts e popup se comunicam por aqui.
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`${LOG_PREFIX} message received: ${request.type || request.action}`);

    switch (request.type || request.action) {

        // --- GRAVACAO DE AUDIO (Meet) ---

        case 'START_RECORDING':
        case 'startRecording':
            handleStartRecording(request.tabId)
                .then(() => sendResponse({ success: true }))
                .catch(err => {
                    console.error(`${LOG_PREFIX} START_RECORDING error:`, err.message);
                    sendResponse({ success: false, error: err.message });
                });
            return true; // Manter canal aberto para resposta assincrona

        case 'STOP_RECORDING':
        case 'stopRecording':
            // Recuperar tabId ANTES de parar (o stop limpa o storage)
            chrome.storage.local.get(['recordingTabId', 'selectedProjectId'], (stored) => {
                const tabId = stored.recordingTabId;
                const projectId = stored.selectedProjectId || null;

                handleStopRecording()
                    .then((audioBlob) => {
                        if (audioBlob) {
                            uploadMeetingAudio(audioBlob, tabId, projectId);
                        }
                        sendResponse({ success: true });
                    })
                    .catch(err => {
                        console.error(`${LOG_PREFIX} STOP_RECORDING error:`, err.message);
                        sendResponse({ success: false, error: err.message });
                    });
            });
            return true;

        // --- SCRAPING DO LINKEDIN ---

        case 'LINKEDIN_SCRAPED':
            handleLinkedInScraped(request.data)
                .then((result) => sendResponse({ success: true, result }))
                .catch(err => {
                    console.error(`${LOG_PREFIX} LINKEDIN_SCRAPED error:`, err.message);
                    sendResponse({ success: false, error: err.message });
                });
            return true;

        // --- GESTAO DE PROJETO E AUTH ---

        case 'SET_PROJECT':
            chrome.storage.local.set({ selectedProjectId: request.projectId, selectedProjectName: request.projectName || '' }, () => {
                console.log(`${LOG_PREFIX} project set: ${request.projectId}`);
                sendResponse({ success: true });
            });
            return true;

        case 'GET_AUTH':
            chrome.storage.local.get(['userJwt', 'userEmail'], (stored) => {
                sendResponse({
                    jwt: stored.userJwt || null,
                    email: stored.userEmail || null,
                    isAuthenticated: !!stored.userJwt,
                });
            });
            return true;

        case 'SET_AUTH':
            chrome.storage.local.set({ userJwt: request.jwt, userEmail: request.email || '' }, () => {
                console.log(`${LOG_PREFIX} auth token stored for: ${request.email}`);
                sendResponse({ success: true });
            });
            return true;

        case 'CLEAR_AUTH':
            chrome.storage.local.remove(['userJwt', 'userEmail'], () => {
                console.log(`${LOG_PREFIX} auth token cleared`);
                sendResponse({ success: true });
            });
            return true;

        // --- DETECCAO DE MEET (enviado pelo content-meet.js) ---

        case 'MEET_DETECTED':
            chrome.storage.local.set({
                meetUrl: request.meetUrl,
                meetTitle: request.meetTitle,
                meetActive: true,
            });
            console.log(`${LOG_PREFIX} meet detected: "${request.meetTitle}"`);
            sendResponse({ success: true });
            return false;

        case 'MEET_ENDED':
            chrome.storage.local.set({ meetActive: false });
            console.log(`${LOG_PREFIX} meet ended`);
            sendResponse({ success: true });
            return false;

        default:
            // Mensagens legadas do content.js original (compatibilidade)
            return false;
    }
});

// ============================================================
// GESTAO DO OFFSCREEN DOCUMENT
// O Offscreen Document tem acesso ao MediaRecorder e getUserMedia
// (o Service Worker nao tem). Ele faz a gravacao real.
// ============================================================

let _offscreenCreating = null; // Previne criacao dupla

async function ensureOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');

    const existing = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl],
    });

    if (existing.length > 0) {
        return; // Ja existe
    }

    if (_offscreenCreating) {
        await _offscreenCreating;
        return;
    }

    _offscreenCreating = chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: ['USER_MEDIA'],
        justification: 'Gravacao de audio do tab Google Meet para transcricao',
    });

    await _offscreenCreating;
    _offscreenCreating = null;
}

// ============================================================
// INICIO DA GRAVACAO
// ============================================================

async function handleStartRecording(tabId) {
    await ensureOffscreenDocument();

    // Obtém stream ID do tab alvo (requer permissao tabCapture)
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });

    // Inicia captura no Offscreen Document
    await chrome.runtime.sendMessage({
        target: 'offscreen',
        action: 'startCapture',
        streamId: streamId,
    });

    // Persiste estado
    await chrome.storage.local.set({
        recordingState: 'recording',
        recordingTabId: tabId,
        recordingStartTime: Date.now(),
    });

    // Badge visual
    chrome.action.setBadgeText({ text: 'REC' });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });

    console.log(`${LOG_PREFIX} recording started on tab ${tabId}`);
}

// ============================================================
// PARADA DA GRAVACAO
// Retorna o Blob de audio ou null em caso de erro.
// ============================================================

async function handleStopRecording() {
    try {
        const response = await chrome.runtime.sendMessage({
            target: 'offscreen',
            action: 'stopCapture',
        });

        // Fecha o Offscreen Document para liberar recursos
        try {
            await chrome.offscreen.closeDocument();
        } catch (e) {
            // Pode falhar se ja foi fechado - ignorar
        }

        // Limpa estado
        chrome.action.setBadgeText({ text: '' });
        await chrome.storage.local.remove(['recordingState', 'recordingTabId', 'recordingStartTime']);

        console.log(`${LOG_PREFIX} recording stopped, blob size: ${response?.audioBlob?.size ?? 'unknown'}`);
        return response?.audioBlob || null;

    } catch (err) {
        // Forca limpeza mesmo em caso de erro
        chrome.action.setBadgeText({ text: '' });
        await chrome.storage.local.remove(['recordingState', 'recordingTabId', 'recordingStartTime']);
        throw err;
    }
}

// ============================================================
// UPLOAD DO AUDIO PARA process-meeting-audio
// Envia como multipart/form-data com os campos esperados pela Edge Function.
// ============================================================

async function uploadMeetingAudio(audioBlob, tabId, projectId) {
    console.log(`${LOG_PREFIX} starting audio upload, size: ${audioBlob.size} bytes`);

    try {
        const { userJwt } = await getStorageValues(['userJwt']);

        if (!userJwt) {
            throw new Error('JWT nao encontrado. Faca login no RevHackers antes de usar a extensao.');
        }

        let meetTitle = 'Reuniao Google Meet';
        let meetUrl = '';

        if (tabId) {
            try {
                const tab = await chrome.tabs.get(tabId);
                meetUrl = tab.url || '';
                meetTitle = (tab.title || 'Reuniao Google Meet').replace(' - Google Meet', '').trim();
            } catch (e) {
                console.warn(`${LOG_PREFIX} could not retrieve tab info:`, e.message);
            }
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('meetUrl', meetUrl);
        formData.append('meetTitle', meetTitle);
        formData.append('recordedAt', new Date().toISOString());

        if (projectId) {
            formData.append('projectId', projectId);
            console.log(`${LOG_PREFIX} upload linked to projectId: ${projectId}`);
        }

        showNotification('Processando...', `Enviando audio para transcricao: "${meetTitle}"`);

        const response = await fetch(ENDPOINTS.PROCESS_MEETING_AUDIO, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userJwt}`,
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log(`${LOG_PREFIX} upload success, recordingId: ${result.recordingId}, type: ${result.meetingType}`);
            showNotification('Transcricao concluida', `Reuniao "${meetTitle}" processada com sucesso.`);
        } else {
            const errMsg = result.error || `HTTP ${response.status}`;
            console.error(`${LOG_PREFIX} upload failed: ${errMsg}`);
            showNotification('Erro no upload', errMsg);
        }

    } catch (err) {
        console.error(`${LOG_PREFIX} uploadMeetingAudio error:`, err.message);
        showNotification('Erro ao enviar audio', err.message);
    }
}

// ============================================================
// ENVIO DOS DADOS DO LINKEDIN PARA scrape-profile
// A Edge Function espera o corpo JSON conforme ScrapedLinkedInProfile.
// ============================================================

async function handleLinkedInScraped(profileData) {
    console.log(`${LOG_PREFIX} linkedin data received for: "${profileData?.fullName}"`);

    const { userJwt, selectedProjectId } = await getStorageValues(['userJwt', 'selectedProjectId']);

    if (!userJwt) {
        throw new Error('JWT nao encontrado. Faca login no RevHackers antes de usar a extensao.');
    }

    // Injeta projectId se houver projeto selecionado e o campo nao vier preenchido
    if (selectedProjectId && !profileData.projectId) {
        profileData.projectId = selectedProjectId;
    }

    // Garante campo obrigatorio scrapedAt
    if (!profileData.scrapedAt) {
        profileData.scrapedAt = new Date().toISOString();
    }

    const response = await fetch(ENDPOINTS.SCRAPE_PROFILE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userJwt}`,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(profileData),
    });

    const result = await response.json();

    if (!response.ok) {
        const errMsg = result.error || `HTTP ${response.status}`;
        console.error(`${LOG_PREFIX} scrape-profile failed: ${errMsg}`);
        throw new Error(errMsg);
    }

    console.log(`${LOG_PREFIX} scrape-profile success: "${result.fullName}" | archetype: ${result.archetype} | score: ${result.authorityScore}`);
    showNotification(
        'Perfil enviado',
        `${result.fullName} - Arquetipo: ${result.archetype} | Score: ${result.authorityScore}`
    );

    return result;
}

// ============================================================
// UTILITARIOS
// ============================================================

/**
 * Wrapper promisificado para chrome.storage.local.get
 */
function getStorageValues(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
}

/**
 * Exibe uma notificacao Chrome (nao intrusiva).
 */
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `RevHackers - ${title}`,
        message: message,
    });
}
