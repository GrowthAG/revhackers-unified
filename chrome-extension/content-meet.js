/**
 * RevHackers Clipper - Content Script: Google Meet
 *
 * Injetado em: https://meet.google.com/*
 *
 * Responsabilidades:
 * - Detectar quando o usuario entra e sai de uma reuniao ativa
 * - Notificar o background service worker (MEET_DETECTED / MEET_ENDED)
 * - Exibir badge flutuante de status de gravacao (canto inferior direito)
 * - Atualizar o badge conforme mensagens do background (recordingStarted / recordingStopped)
 */

const LOG_PREFIX = '[revhackers-ext]';

// ============================================================
// BADGE DE STATUS
// ============================================================

let badgeEl = null;
let badgeState = 'idle'; // 'idle' | 'recording'

function createBadge() {
    if (badgeEl) return;

    badgeEl = document.createElement('div');
    badgeEl.id = 'revhackers-meet-badge';
    badgeEl.setAttribute('data-state', 'idle');

    // Estilos inline para nao depender de arquivo CSS separado
    // e nao colidir com estilos do Meet
    Object.assign(badgeEl.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        background: 'rgba(9, 9, 11, 0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#a1a1aa',
        pointerEvents: 'none',
        userSelect: 'none',
        transition: 'opacity 0.2s',
    });

    // Dot de status
    const dot = document.createElement('span');
    dot.id = 'revhackers-meet-dot';
    Object.assign(dot.style, {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#52525b',
        flexShrink: '0',
    });

    const label = document.createElement('span');
    label.id = 'revhackers-meet-label';
    label.textContent = 'RevHackers';

    badgeEl.appendChild(dot);
    badgeEl.appendChild(label);
    document.body.appendChild(badgeEl);

    console.log(`${LOG_PREFIX} meet badge created`);
}

function updateBadge(state) {
    if (!badgeEl) createBadge();

    const dot = document.getElementById('revhackers-meet-dot');
    const label = document.getElementById('revhackers-meet-label');

    if (!dot || !label) return;

    badgeState = state;

    if (state === 'recording') {
        dot.style.background = '#ff4444';
        dot.style.animation = 'revhackers-blink 1s infinite';
        label.textContent = 'Gravando';
        badgeEl.style.color = '#ffffff';
        badgeEl.style.borderColor = 'rgba(255,68,68,0.3)';
        // Injeta keyframe se ainda nao existir
        injectBlinkKeyframe();
    } else if (state === 'processing') {
        dot.style.background = '#00CC6A';
        dot.style.animation = 'none';
        label.textContent = 'Processando...';
        badgeEl.style.color = '#00CC6A';
        badgeEl.style.borderColor = 'rgba(0,204,106,0.3)';
    } else {
        // idle
        dot.style.background = '#52525b';
        dot.style.animation = 'none';
        label.textContent = 'RevHackers';
        badgeEl.style.color = '#a1a1aa';
        badgeEl.style.borderColor = 'rgba(255,255,255,0.1)';
    }
}

function injectBlinkKeyframe() {
    if (document.getElementById('revhackers-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'revhackers-keyframes';
    style.textContent = `
        @keyframes revhackers-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================================
// DETECCAO DE REUNIAO ATIVA
// Verifica elementos DOM especificos do Google Meet para
// determinar se o usuario esta em uma call ativa.
// ============================================================

let meetDetected = false;
let detectionObserver = null;

/**
 * Seletores que indicam presença na reuniao.
 * Nota: O DOM do Meet muda com frequência; esta lista deve ser atualizada
 * se os seletores pararem de funcionar apos atualizacoes do Meet.
 */
const MEET_ACTIVE_SELECTORS = [
    '[data-call-ended="false"]',
    '[data-participant-id]',
    '[jsname="YB8uRe"]',   // Botao de microfone na barra inferior
    '[jsname="CQylAd"]',   // Botao de camera
    '[data-meeting-title]',
];

function isMeetingActive() {
    // Verifica URL - paginas de lobby (/lookup, /new, /) nao sao reunioes ativas
    const path = window.location.pathname;
    if (path === '/' || path === '/new' || path.includes('lookup')) {
        return false;
    }

    // Um codigo de reuniao valido tem o formato /xxx-xxxx-xxx
    const meetCodePattern = /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
    if (!meetCodePattern.test(path)) {
        return false;
    }

    // Verifica presenca de elementos da UI da call
    return MEET_ACTIVE_SELECTORS.some(sel => document.querySelector(sel) !== null);
}

function getMeetInfo() {
    const titleEl = document.querySelector('[data-meeting-title]');
    const meetTitle =
        titleEl?.textContent?.trim() ||
        document.title.replace(' - Google Meet', '').trim() ||
        'Reuniao Google Meet';

    return {
        meetUrl: window.location.href,
        meetTitle: meetTitle,
    };
}

function notifyMeetDetected() {
    if (meetDetected) return; // Ja notificado para esta sessao

    const info = getMeetInfo();
    meetDetected = true;

    console.log(`${LOG_PREFIX} meet active detected: "${info.meetTitle}"`);

    chrome.runtime.sendMessage({
        type: 'MEET_DETECTED',
        meetUrl: info.meetUrl,
        meetTitle: info.meetTitle,
    }).catch(() => {
        // Service worker pode estar dormindo; ignorar erro silenciosamente
    });

    if (!badgeEl) createBadge();
}

function notifyMeetEnded() {
    if (!meetDetected) return;

    meetDetected = false;
    console.log(`${LOG_PREFIX} meet ended`);

    chrome.runtime.sendMessage({ type: 'MEET_ENDED' }).catch(() => {});

    updateBadge('idle');
}

/**
 * Observa mudancas no DOM para detectar inicio/fim da reuniao.
 * O Meet e uma SPA; os elementos aparecem e desaparecem dinamicamente.
 */
function startMeetObserver() {
    if (detectionObserver) return;

    let checkTimeout = null;

    const scheduleCheck = () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(() => {
            if (isMeetingActive()) {
                notifyMeetDetected();
            } else if (meetDetected) {
                notifyMeetEnded();
            }
        }, 800);
    };

    detectionObserver = new MutationObserver(scheduleCheck);

    detectionObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
    });

    // Checagem inicial
    scheduleCheck();

    console.log(`${LOG_PREFIX} meet observer started`);
}

// ============================================================
// LISTENER DE MENSAGENS DO BACKGROUND
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const action = request.type || request.action;

    if (action === 'recordingStarted') {
        updateBadge('recording');
        sendResponse({ success: true });
    } else if (action === 'recordingStopped') {
        updateBadge('processing');
        // Apos alguns segundos volta para idle
        setTimeout(() => updateBadge('idle'), 5000);
        sendResponse({ success: true });
    } else if (action === 'GET_MEET_INFO') {
        sendResponse(getMeetInfo());
    }
});

// ============================================================
// INICIALIZACAO
// ============================================================

function init() {
    // Aguarda o body estar disponivel
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    createBadge();
    startMeetObserver();

    console.log(`${LOG_PREFIX} content-meet.js initialized on ${window.location.href}`);
}

init();
