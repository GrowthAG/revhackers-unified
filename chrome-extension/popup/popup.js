/**
 * RevHackers Clipper - Popup Controller
 * Detecta contexto (Meet / LinkedIn / outro) e renderiza UI adequada.
 */

let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  const authDot = document.getElementById('authDot');

  const SUPABASE_URL = 'https://eqspbruarsdybpfeijnf.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

  // 1. Read auth DIRECTLY from chrome.storage.local (no message passing needed)
  // This avoids the race condition where the service worker is dormant
  const stored = await chrome.storage.local.get(['userJwt', 'userEmail', 'refreshToken', 'tokenExpiresAt']);
  console.log('[popup] auth check - jwt exists:', !!stored.userJwt, '| refreshToken exists:', !!stored.refreshToken, '| expiresAt:', stored.tokenExpiresAt ? new Date(stored.tokenExpiresAt).toISOString() : 'none');

  let auth = {
    jwt: stored.userJwt || null,
    email: stored.userEmail || null,
    isAuthenticated: !!stored.userJwt,
  };
  let isAuth = !!auth.jwt;

  // Auto-refresh: if token is expired or close to expiring (less than 5 min), refresh it
  const expiresAt = stored.tokenExpiresAt || 0;
  const fiveMinutes = 5 * 60 * 1000;
  const tokenExpiredOrClose = expiresAt > 0 && Date.now() > (expiresAt - fiveMinutes);

  if (stored.refreshToken && (!isAuth || tokenExpiredOrClose)) {
    // We have a refresh token - try to get a fresh JWT even if the old one is gone
    console.log('[popup] attempting token refresh - expired:', !isAuth, '| close to expiry:', tokenExpiredOrClose);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
        body: JSON.stringify({ refresh_token: stored.refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        console.log('[popup] token refresh success - new expiry:', data.expires_in, 's');
        // Persist new tokens in storage directly
        await chrome.storage.local.set({
          userJwt: data.access_token,
          userEmail: data.user?.email || auth.email || '',
          refreshToken: data.refresh_token,
          tokenExpiresAt: Date.now() + (data.expires_in * 1000),
        });
        auth = { jwt: data.access_token, email: data.user?.email || auth.email, isAuthenticated: true };
        isAuth = true;
      } else {
        console.warn('[popup] token refresh failed:', data.error_description || data.error || 'unknown');
        // Refresh token is invalid - clear everything so user sees login
        if (!isAuth) {
          await chrome.storage.local.remove(['userJwt', 'userEmail', 'refreshToken', 'tokenExpiresAt']);
        }
      }
    } catch (e) {
      console.warn('[popup] token refresh network error:', e.message);
      // If we still have a JWT (maybe not expired yet), keep going
    }
  }

  if (isAuth) {
    authDot.classList.add('ok');
    // Show "Conectado como X" indicator
    const authInfo = document.getElementById('authInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    if (authInfo && auth.email) {
      authInfo.textContent = auth.email;
      authInfo.style.display = 'block';
    }
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
      logoutBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove(['userJwt', 'userEmail', 'refreshToken', 'tokenExpiresAt']);
        // Also notify background in case it is awake
        msg({ type: 'CLEAR_AUTH' }).catch(() => {});
        window.location.reload();
      });
    }
    console.log('[popup] authenticated as:', auth.email);
  }

  if (!isAuth) {
    renderLogin(content, authDot);
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
  const stored = await chrome.storage.local.get(['recordingState', 'recordingStartTime', 'autoRecord', 'lastUploadMsg']);
  let isRecording = stored.recordingState === 'recording';
  let startTime   = stored.recordingStartTime || null;
  let statusMsg   = stored.lastUploadMsg || null;

  content.innerHTML = `
    <div class="panel">
      <div class="context-label">Google Meet</div>
      <div class="status-badge ${isRecording ? 'recording' : ''}" id="badge">
        <span class="rec-dot"></span>
        <span id="badgeText">${isRecording ? 'Gravando...' : 'Pronto para gravar'}</span>
      </div>

      <div style="margin-top: 14px; margin-bottom: 5px;">
        <label style="display:block; margin-bottom:5px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#71717a;">Vincular Gravação ao Cartão:</label>
        <select id="projectSelect" ${isRecording ? 'disabled' : ''} style="width:100%; padding:10px; border-radius:6px; border:1px solid #e4e4e7; font-size:11px; font-weight:700; background:#f4f4f5; color:#09090b; outline:none;">
           <option value="">Nenhum (Gravação Órfã)</option>
        </select>
      </div>

      <div class="timer" id="timer" style="display:${isRecording ? 'block' : 'none'}">00:00:00</div>
      
      ${statusMsg ? `<div id="lastMsgBox" style="margin-bottom:10px; padding:10px; border-radius:6px; font-size:10px; font-weight:700; word-break:break-all; ${statusMsg.includes('Erro') || statusMsg.includes('❌') ? 'background:#fef2f2; border: 1px solid #fca5a5; color:#ef4444;' : 'background:#f0fdf4; border: 1px solid #bbf7d0; color:#166534;'}">
         Mensagem do Servidor: <br/><span style="font-weight:500;">${statusMsg}</span>
         <button id="clearMsgBtn" style="float:right; border:none; background:none; cursor:pointer; font-weight:900;">✕</button>
      </div>` : ''}

      <button class="btn-primary ${isRecording ? 'stop' : ''}" id="recBtn" style="margin-top: 10px;">
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
          Gravar automaticamente ao entrar na call
        </label>
        <div style="font-size:9px; color:#a1a1aa; margin-top:2px; padding-left:20px;">
          Quando ativado, a gravacao e transcricao iniciam sozinhas ao entrar no Meet.
        </div>
      </div>
    </div>
  `;

  if (isRecording && startTime) startTimer(startTime);

  const clearMsgBtn = document.getElementById('clearMsgBtn');
  if (clearMsgBtn) {
     clearMsgBtn.addEventListener('click', () => {
         chrome.storage.local.remove('lastUploadMsg');
         document.getElementById('lastMsgBox').style.display = 'none';
     });
  }

  document.getElementById('autoRecord').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoRecord: e.target.checked });
  });

  document.getElementById('projectSelect').addEventListener('change', async (e) => {
    const projId = e.target.value;
    const projName = e.target.options[e.target.selectedIndex].text;
    await msg({ type: 'SET_PROJECT', projectId: projId || null, projectName: projId ? projName : '' });
  });

  // Busca projetos e popula o dropdown
  await loadProjectsDropdown();

  document.getElementById('recBtn').addEventListener('click', async () => {
    const btn = document.getElementById('recBtn');
    btn.disabled = true;

    if (isRecording) {
      document.getElementById('badgeText').textContent = 'Finalizando gravação...';
      
      // Timeout forçado de 3 segundos pra não travar a UI nunca
      const timeoutMsg = new Promise(resolve => setTimeout(() => resolve({ success: false, error: 'Demorou muito para responder (TIMEOUT)' }), 3000));
      await Promise.race([
          msg({ action: 'stopRecording' }),
          timeoutMsg
      ]);
      
      isRecording = false;
      stopTimer();
      refreshMeetUI(false);
    } else {
      document.getElementById('badgeText').textContent = 'Acionando motores...';
      const res = await msg({ action: 'startRecording', tabId: tab.id });
      if (res?.success) {
        isRecording = true;
        const now = Date.now();
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
    const select    = document.getElementById('projectSelect');

    badge.className   = `status-badge ${recording ? 'recording' : ''}`;
    badgeText.textContent = recording ? 'Gravando...' : 'Pronto para gravar';
    btn.textContent   = recording ? 'Parar Gravacao' : 'Iniciar Gravacao';
    btn.className     = `btn-primary ${recording ? 'stop' : ''}`;
    timer.style.display = recording ? 'block' : 'none';
    if(select) select.disabled = recording; // Impede mudar de projeto no meio
  }

  // Logout de emergência pra JWT expirado
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await msg({ type: 'CLEAR_AUTH' });
    window.close();
  });

}

// CONTEXTO: LINKEDIN
async function renderLinkedIn(content, tab) {
  content.innerHTML = `
    <div class="panel">
      <div class="context-label">LinkedIn OSINT</div>
      <div class="status-badge linkedin" id="badge">
        <span>Perfil detectado</span>
      </div>

      <div style="margin-top: 14px; margin-bottom: 5px;">
        <label style="display:block; margin-bottom:5px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#71717a;">Vincular Perfil ao Cartão:</label>
        <select id="projectSelect" style="width:100%; padding:10px; border-radius:6px; border:1px solid #e4e4e7; font-size:11px; font-weight:700; background:#f4f4f5; color:#09090b; outline:none;">
           <option value="">Nenhum (Somente extrair dados)</option>
        </select>
      </div>

      <button class="btn-primary sync" id="syncBtn" style="margin-top: 10px;">
        Sincronizar com RevHackers
      </button>
    </div>
    <div class="info">
      <strong>O que sera coletado:</strong><br>
      Nome, cargo, empresa, seguidores, experiencias e ultimos posts publicos.
      Os dados sao salvos no perfil do cliente no hub.
    </div>
  `;

  document.getElementById('projectSelect').addEventListener('change', async (e) => {
    const projId = e.target.value;
    const projName = e.target.options[e.target.selectedIndex].text;
    await msg({ type: 'SET_PROJECT', projectId: projId || null, projectName: projId ? projName : '' });
  });

  await loadProjectsDropdown();

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

// LOGIN DIRETO NA EXTENSAO
function renderLogin(content, authDot) {
  content.innerHTML = `
    <div class="panel" style="padding-top: 24px;">
      <div class="context-label">Login RevHackers</div>
      <div id="loginError" style="display:none; margin-bottom:12px; padding:10px; border-radius:6px; font-size:11px; font-weight:700; background:#fef2f2; border:1px solid #fca5a5; color:#ef4444;"></div>
      <div style="margin-bottom: 12px;">
        <label style="display:block; margin-bottom:4px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#71717a;">Email</label>
        <input type="email" id="loginEmail" placeholder="seu@email.com" style="width:100%; padding:10px; border-radius:6px; border:1px solid #e4e4e7; font-size:12px; font-weight:600; background:#f4f4f5; color:#09090b; outline:none;" />
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display:block; margin-bottom:4px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#71717a;">Senha</label>
        <input type="password" id="loginPassword" placeholder="Sua senha" style="width:100%; padding:10px; border-radius:6px; border:1px solid #e4e4e7; font-size:12px; font-weight:600; background:#f4f4f5; color:#09090b; outline:none;" />
      </div>
      <button class="btn-primary" id="loginBtn">Entrar</button>
    </div>
    <div class="info" style="padding: 12px 16px; text-align:center;">
      Use o mesmo email e senha do RevHackers Hub.
    </div>
  `;

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // Enter key submits
  passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
  emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passInput.focus(); });

  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      loginError.textContent = 'Preencha email e senha.';
      loginError.style.display = 'block';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Autenticando...';
    loginError.style.display = 'none';

    try {
      const SUPABASE_URL = 'https://eqspbruarsdybpfeijnf.supabase.co';
      const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        // Salva JWT e refresh token na extensao
        await msg({ type: 'SET_AUTH', jwt: data.access_token, email: data.user?.email || email });

        // Salva refresh token para renovacao automatica
        await chrome.storage.local.set({
          refreshToken: data.refresh_token,
          tokenExpiresAt: Date.now() + (data.expires_in * 1000),
        });

        authDot.classList.add('ok');

        // Recarrega o popup para mostrar o contexto correto
        window.location.reload();
      } else {
        const errMsg = data.error_description || data.msg || 'Email ou senha incorretos.';
        loginError.textContent = errMsg;
        loginError.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
      }
    } catch (err) {
      loginError.textContent = 'Erro de conexao. Tente novamente.';
      loginError.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    }
  });
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

async function loadProjectsDropdown() {
  const select = document.getElementById('projectSelect');
  if (!select) return;
  
  try {
    // Read JWT directly from storage (avoids service worker wake-up race)
    const authStore = await chrome.storage.local.get(['userJwt']);
    if(!authStore?.userJwt) return;
    const auth = { jwt: authStore.userJwt };

    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY";
    const REST_URL = "https://eqspbruarsdybpfeijnf.supabase.co/rest/v1/rei_projects?select=id,client_name,status&order=client_name.asc";

    const res = await fetch(REST_URL, {
      headers: {
          'Authorization': `Bearer ${auth.jwt}`,
          'apikey': API_KEY
      }
    });
    
    const data = await res.json();
    
    if(Array.isArray(data)) {
      const stored = await chrome.storage.local.get('selectedProjectId');
      const currentId = stored.selectedProjectId;
      
      let html = '<option value="">Nenhum / Não Vincular</option>';
      data.forEach(p => {
          const name = p.client_name || 'Sem nome';
          const statusLabel = p.status === 'lead' ? '🔵 [LEAD]' : '🟢 [PROJETO]';
          const selected = p.id === currentId ? 'selected' : '';
          html += '<option value="' + p.id + '" ' + selected + '>' + statusLabel + ' ' + name + '</option>';
      });
      
      select.innerHTML = html;
    }
  } catch (e) {
    console.error('Failed to load projects dropdown', e);
  }
}
