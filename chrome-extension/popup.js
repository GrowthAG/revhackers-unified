/**
 * RevHackers Clipper - Popup Controller
 * Detecta contexto (Meet / LinkedIn / outro) e renderiza UI adequada.
 */

let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  const authDot = document.getElementById('authDot');

  // 1. Checar autenticacao
  const auth = await msg({ type: 'GET_AUTH' });
  const isAuth = !!auth?.jwt;

  if (isAuth) authDot.classList.add('ok');

  if (!isAuth) {
    content.innerHTML = `
      <div class="not-auth">
        <p>Faca login no RevHackers Hub para usar a extensao.</p>
        <a href="https://revhackers.com.br" target="_blank">Abrir RevHackers</a>
      </div>
    `;
    return;
  }

  // 2. Detectar aba atual
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isMeet     = url.includes('meet.google.com');
  const isLinkedIn = url.includes('linkedin.com/in/') || url.includes('linkedin.com/company/');

  // 3. Renderizar contexto correto
  if (isMeet)         renderMeet(content, tab);
  else if (isLinkedIn) renderLinkedIn(content, tab);
  else                 renderIdle(content);
});

// CONTEXTO: GOOGLE MEET
async function renderMeet(content, tab) {
  const stored = await chrome.storage.local.get(['isRecording', 'recordingStartTime', 'autoRecord']);
  let isRecording = stored.isRecording || false;
  let startTime   = stored.recordingStartTime || null;

  content.innerHTML = `
    <div class="panel">
      <div class="context-label">Google Meet</div>
      <div class="status-badge ${isRecording ? 'recording' : ''}" id="badge">
        <span class="rec-dot"></span>
        <span id="badgeText">${isRecording ? 'Gravando...' : 'Pronto para gravar'}</span>
      </div>
      <div class="timer" id="timer" style="display:${isRecording ? 'block' : 'none'}">00:00:00</div>
      <button class="btn-primary ${isRecording ? 'stop' : ''}" id="recBtn">
        ${isRecording ? 'Parar Gravacao' : 'Iniciar Gravacao'}
      </button>
    </div>
    <div class="info">
      <strong>Como usar:</strong><br>
      Inicie a gravacao durante a reuniao.<br>
      Ao parar, o audio e transcrito automaticamente no hub.
    </div>
    <hr style="margin:0">
    <div class="panel" style="padding-top:10px;padding-bottom:12px;">
      <div class="settings-row">
        <label>
          <input type="checkbox" id="autoRecord" ${stored.autoRecord ? 'checked' : ''}>
          Gravar automaticamente ao entrar
        </label>
      </div>
    </div>
  `;

  if (isRecording && startTime) startTimer(startTime);

  document.getElementById('autoRecord').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoRecord: e.target.checked });
  });

  document.getElementById('recBtn').addEventListener('click', async () => {
    const btn = document.getElementById('recBtn');
    btn.disabled = true;

    if (isRecording) {
      await msg({ action: 'stopRecording' });
      isRecording = false;
      await chrome.storage.local.set({ isRecording: false, recordingStartTime: null });
      stopTimer();
      refreshMeetUI(false);
    } else {
      const res = await msg({ action: 'startRecording', tabId: tab.id });
      if (res?.success) {
        isRecording = true;
        const now = Date.now();
        await chrome.storage.local.set({ isRecording: true, recordingStartTime: now });
        startTimer(now);
        refreshMeetUI(true);
      } else {
        document.getElementById('badgeText').textContent = 'Erro: ' + (res?.error || 'Falha');
      }
    }
    btn.disabled = false;
  });

  function refreshMeetUI(recording) {
    const badge     = document.getElementById('badge');
    const badgeText = document.getElementById('badgeText');
    const btn       = document.getElementById('recBtn');
    const timer     = document.getElementById('timer');

    badge.className   = `status-badge ${recording ? 'recording' : ''}`;
    badgeText.textContent = recording ? 'Gravando...' : 'Pronto para gravar';
    btn.textContent   = recording ? 'Parar Gravacao' : 'Iniciar Gravacao';
    btn.className     = `btn-primary ${recording ? 'stop' : ''}`;
    timer.style.display = recording ? 'block' : 'none';
  }
}

// CONTEXTO: LINKEDIN
async function renderLinkedIn(content, tab) {
  content.innerHTML = `
    <div class="panel">
      <div class="context-label">LinkedIn OSINT</div>
      <div class="status-badge linkedin" id="badge">
        <span>Perfil detectado</span>
      </div>
      <button class="btn-primary sync" id="syncBtn">
        Sincronizar com RevHackers
      </button>
    </div>
    <div class="info">
      <strong>O que sera coletado:</strong><br>
      Nome, cargo, empresa, seguidores, experiencias e ultimos posts publicos.
      Os dados sao salvos no perfil do cliente no hub.
    </div>
  `;

  document.getElementById('syncBtn').addEventListener('click', async () => {
    const btn   = document.getElementById('syncBtn');
    const badge = document.getElementById('badge');

    btn.disabled = true;
    btn.textContent = 'Sincronizando...';

    try {
      const res = await chrome.tabs.sendMessage(tab.id, { action: 'triggerScrape' });

      if (res?.success) {
        badge.innerHTML = '<span>Sincronizado com sucesso</span>';
        badge.className = 'status-badge' ;
        badge.style.background = '#dcfce7';
        badge.style.color = '#166534';
        btn.textContent = 'Concluido';
        btn.style.background = '#09090b';
      } else {
        badge.innerHTML = '<span>Erro ao sincronizar</span>';
        btn.textContent = 'Tentar novamente';
        btn.disabled = false;
      }
    } catch (e) {
      badge.innerHTML = `<span>Erro: ${e.message}</span>`;
      btn.textContent = 'Tentar novamente';
      btn.disabled = false;
    }
  });
}

// CONTEXTO: IDLE
function renderIdle(content) {
  content.innerHTML = `
    <div class="panel">
      <div class="context-label">Sem contexto ativo</div>
      <div class="status-badge">
        <span class="rec-dot"></span>
        <span>Aguardando acao</span>
      </div>
    </div>
    <div class="info">
      <strong>Para usar:</strong><br>
      - Abra um <strong>perfil no LinkedIn</strong> para coletar dados OSINT<br>
      - Entre em uma <strong>reuniao no Meet</strong> para gravar e transcrever
    </div>
  `;
}

// HELPERS
function msg(payload) {
  return new Promise((resolve) => {
    try { chrome.runtime.sendMessage(payload, (res) => resolve(res || null)); }
    catch (e) { resolve(null); }
  });
}

function startTimer(startTime) {
  stopTimer();
  const el = document.getElementById('timer');
  if (!el) return;
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    if (el) el.textContent =
      String(h).padStart(2,'0') + ':' +
      String(m).padStart(2,'0') + ':' +
      String(s).padStart(2,'0');
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}
