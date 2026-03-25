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
// WEB SPEECH API - TRANSCRICAO EM TEMPO REAL (GRATIS)
// Usa o reconhecimento de voz nativo do Chrome (Google Speech)
// para transcrever a call sem depender do Whisper (pago).
// ============================================================

let speechRecognition = null;
let transcriptParts = [];
let isTranscribing = false;

function startTranscription() {
    if (isTranscribing) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn(`${LOG_PREFIX} Web Speech API nao suportada neste navegador`);
        return;
    }

    transcriptParts = [];
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false; // So resultados finais (mais precisos)
    speechRecognition.lang = 'pt-BR';
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const text = event.results[i][0].transcript.trim();
                if (text) {
                    transcriptParts.push(text);
                    console.log(`${LOG_PREFIX} [speech] chunk: "${text.substring(0, 60)}..."`);
                }
            }
        }
    };

    speechRecognition.onerror = (event) => {
        console.warn(`${LOG_PREFIX} [speech] error: ${event.error}`);
        // 'no-speech' e 'aborted' sao comuns e nao criticos - reiniciar
        if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
            if (isTranscribing) {
                setTimeout(() => {
                    if (isTranscribing && speechRecognition) {
                        try { speechRecognition.start(); } catch (_) {}
                    }
                }, 500);
            }
        }
    };

    speechRecognition.onend = () => {
        // Web Speech API para automaticamente apos silencio - reiniciar se ainda gravando
        if (isTranscribing) {
            try { speechRecognition.start(); } catch (_) {}
        }
    };

    try {
        speechRecognition.start();
        isTranscribing = true;
        console.log(`${LOG_PREFIX} [speech] transcricao em tempo real iniciada (pt-BR)`);
    } catch (e) {
        console.error(`${LOG_PREFIX} [speech] falha ao iniciar:`, e);
    }
}

function stopTranscription() {
    isTranscribing = false;
    if (speechRecognition) {
        try { speechRecognition.stop(); } catch (_) {}
        speechRecognition = null;
    }
    const fullTranscript = transcriptParts.join(' ');
    console.log(`${LOG_PREFIX} [speech] transcricao finalizada. ${transcriptParts.length} chunks, ${fullTranscript.length} chars`);
    return fullTranscript;
}

function getTranscript() {
    return transcriptParts.join(' ');
}

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
let heartbeatInterval = null;
let lastKnownUrl = window.location.href;

/**
 * Seletores que indicam presenca na reuniao.
 * Nota: O DOM do Meet muda com frequencia; esta lista deve ser atualizada
 * se os seletores pararem de funcionar apos atualizacoes do Meet.
 */
const MEET_ACTIVE_SELECTORS = [
    '[data-call-ended="false"]',
    '[data-participant-id]',    // Sempre presente durante a call (nao depende do toolbar)
    '[data-self-name]',         // Nome do participante local (nao depende do toolbar)
    '[data-meeting-title]',     // Titulo da reuniao (nao depende do toolbar)
    '[jsname="YB8uRe"]',       // Botao de microfone (pode estar hidden pelo auto-hide)
    '[jsname="CQylAd"]',       // Botao de camera (pode estar hidden pelo auto-hide)
    'div[data-requested-participant-id]',  // Grid de participantes
    'div[data-allocation-index]',          // Slot de video de participante
];

/**
 * Seletores que indicam que a call acabou (tela pos-call).
 * Se qualquer um destes existir, a call nao esta mais ativa.
 */
const MEET_ENDED_SELECTORS = [
    '[data-call-ended="true"]',
    '[jsname="CQylAd"][aria-label*="leave" i]', // "Leave call" button on post-call screen
    '[jsname="CQylAd"][aria-label*="sair" i]',
    'button[aria-label*="Rejoin" i]',   // Rejoin button = call already ended
    'button[aria-label*="Reentrar" i]', // PT-BR rejoin
];

/**
 * Textos que indicam que o usuario saiu da call.
 * Suporte a PT-BR e EN - inclui variantes com e sem acento.
 */
const MEET_ENDED_TEXTS = [
    'saiu da reunião',
    'saiu da reuniao',
    'you left the meeting',
    'voce saiu da reuniao',
    'removed from the meeting',
    'removido da reunião',
    'removido da reuniao',
    'the meeting has ended',
    'a reunião terminou',
    'a reuniao terminou',
    // NOTA: "rejoin", "left the meeting" (sem "you"), "return to home screen"
    // foram REMOVIDOS por causar falsos positivos durante calls ativas.
    // Os seletores MEET_ENDED_SELECTORS ja capturam o botao Rejoin/Reentrar.
];

/**
 * Seletores para a barra de controles da call (mute, camera, hang up).
 * Se esta barra desaparecer, a call provavelmente acabou.
 */
const CALL_CONTROLS_SELECTORS = [
    '[jsname="YB8uRe"]',   // Botao de microfone
    '[jsname="CQylAd"]',   // Botao de camera
    '[jsname="CQylAd"]',   // Botao de camera (fallback)
    'button[aria-label*="microphone" i]',
    'button[aria-label*="microfone" i]',
    'button[aria-label*="camera" i]',
    'button[aria-label*="câmera" i]',
    '[data-tooltip*="microphone" i]',
    '[data-tooltip*="microfone" i]',
];

function hasCallControls() {
    return CALL_CONTROLS_SELECTORS.some(sel => {
        try { return document.querySelector(sel) !== null; } catch (_) { return false; }
    });
}

function hasEndedText() {
    // Check visible text in the page for ended indicators.
    // Verifica elementos com tamanho razoavel de texto (5-500 chars).
    // Elementos < 5 chars nao contem frases significativas.
    // Elementos > 500 chars sao containers pai que agregam texto de filhos.
    const candidates = document.querySelectorAll('div, span, h1, h2, p');
    for (const el of candidates) {
        const text = el.textContent || '';
        if (text.length < 5 || text.length > 500) continue;
        const lower = text.toLowerCase();
        for (const endedText of MEET_ENDED_TEXTS) {
            if (lower.includes(endedText)) {
                console.log(`${LOG_PREFIX} ended text found: "${endedText}" in <${el.tagName}> ("${text.substring(0, 80)}")`);
                return true;
            }
        }
    }
    return false;
}

function hasEndedSelectors() {
    return MEET_ENDED_SELECTORS.some(sel => {
        try { return document.querySelector(sel) !== null; } catch (_) { return false; }
    });
}

function hasValidMeetUrl() {
    const path = window.location.pathname;
    if (path === '/' || path === '/new' || path.includes('lookup')) {
        return false;
    }
    const meetCodePattern = /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
    return meetCodePattern.test(path);
}

/**
 * Detecta se a call DEFINITIVAMENTE acabou.
 *
 * ESTRATEGIA EM 2 CAMADAS:
 * Camada 1 (evidencia positiva): Texto/seletores de tela pos-call.
 *   Funciona sempre, mesmo nos primeiros segundos.
 * Camada 2 (ausencia total de sinais): Nenhum seletor ativo E nenhum controle.
 *   Segura porque o background tem grace period de 15s que protege contra
 *   falsos positivos causados por toolbar auto-hide no inicio da call.
 */
function isMeetDefinitelyEnded() {
    // 1. URL saiu do padrao de meet code
    if (!hasValidMeetUrl()) {
        console.log(`${LOG_PREFIX} ENDED: URL no longer valid meet code`);
        return true;
    }

    // 2. Seletores de tela pos-call (Rejoin, data-call-ended=true)
    if (hasEndedSelectors()) {
        console.log(`${LOG_PREFIX} ENDED: ended selector found`);
        return true;
    }

    // 3. Texto de fim de call na tela
    if (hasEndedText()) {
        console.log(`${LOG_PREFIX} ENDED: ended text found`);
        return true;
    }

    // 4. AUSENCIA TOTAL de sinais ativos.
    // Se NENHUM seletor de call ativa E NENHUM controle de call for encontrado,
    // provavelmente a call acabou. O grace period do background (15s) protege
    // contra falsos positivos por toolbar auto-hide no inicio da gravacao.
    const hasActive = MEET_ACTIVE_SELECTORS.some(sel => {
        try { return document.querySelector(sel) !== null; } catch (_) { return false; }
    });
    const hasControls = hasCallControls();
    if (!hasActive && !hasControls) {
        console.log(`${LOG_PREFIX} ENDED: zero active selectors AND zero call controls`);
        return true;
    }

    return false;
}

/**
 * Detecta se o usuario entrou em uma call ativa (para o MEET_DETECTED inicial).
 * Usa seletores amplos - basta UM match para considerar ativo.
 */
function isMeetingActive() {
    if (!hasValidMeetUrl()) return false;

    // Qualquer seletor ativo OU controles de call presentes
    const hasActive = MEET_ACTIVE_SELECTORS.some(sel => {
        try { return document.querySelector(sel) !== null; } catch (_) { return false; }
    });

    const hasControls = hasCallControls();

    return hasActive || hasControls;
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

    console.log(`${LOG_PREFIX} === MEET ENDED === sending MEET_ENDED to background`);

    // Envia MEET_ENDED e espera resposta do background.
    // Se o background REJEITAR (grace period), NAO reseta meetDetected
    // para que o heartbeat continue monitorando e envie novamente depois.
    chrome.runtime.sendMessage({ type: 'MEET_ENDED' }, (response) => {
        if (chrome.runtime.lastError) {
            // Service worker dormindo - tenta novamente em 2s
            console.warn(`${LOG_PREFIX} MEET_ENDED send failed, retrying in 2s:`, chrome.runtime.lastError.message);
            setTimeout(() => notifyMeetEnded(), 2000);
            return;
        }

        if (response?.accepted === false) {
            // Background rejeitou (grace period) - NAO resetar meetDetected.
            // O heartbeat vai continuar chamando runCheck() e reenviara
            // MEET_ENDED quando o grace period expirar.
            console.log(`${LOG_PREFIX} MEET_ENDED REJEITADO pelo background (${response.reason}). Continuando a monitorar.`);
            // meetDetected permanece true - proximo heartbeat tentara novamente
            return;
        }

        // Background aceitou - resetar estado
        console.log(`${LOG_PREFIX} MEET_ENDED ACEITO pelo background. Resetando estado.`);
        meetDetected = false;
        updateBadge('idle');
    });
}

/**
 * Observa mudancas no DOM para detectar inicio/fim da reuniao.
 * O Meet e uma SPA; os elementos aparecem e desaparecem dinamicamente.
 *
 * Strategy (multi-layer):
 * 1. MutationObserver on body - catches most DOM changes
 * 2. Heartbeat polling every 5s - catches cases where MutationObserver misses
 * 3. URL change detection via polling - catches SPA navigation
 * 4. characterData observation - catches text node changes ("You left...")
 */
function startMeetObserver() {
    if (detectionObserver) return;

    let checkTimeout = null;

    const runCheck = (source) => {
        if (!meetDetected) {
            // Ainda nao detectou call - tenta detectar
            if (isMeetingActive()) {
                notifyMeetDetected();
            }
            return;
        }

        // Call ja foi detectada - so para com evidencia DEFINITIVA
        if (isMeetDefinitelyEnded()) {
            console.log(`${LOG_PREFIX} [${source}] CALL ENDED (definitive evidence)`);
            notifyMeetEnded();
        }
        // Se nao acabou definitivamente, NAO faz nada - gravacao continua
    };

    const scheduleCheck = (source) => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(() => runCheck(source || 'mutation'), 600);
    };

    // Layer 1: MutationObserver - broad DOM changes
    detectionObserver = new MutationObserver(() => scheduleCheck('mutation'));

    detectionObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true, // Catches text changes like "You left the meeting"
        attributeFilter: ['data-call-ended', 'data-participant-id', 'data-self-name', 'aria-label'],
    });

    // Initial check
    scheduleCheck('init');

    // Layer 2: Heartbeat every 3s
    // Verifica periodicamente se a call acabou (sinais definitivos)
    // ou se uma call comecou (para deteccao inicial)
    heartbeatInterval = setInterval(() => runCheck('heartbeat'), 3000);

    // Layer 3: URL change detection
    // Meet is a SPA - the URL can change without a page load.
    // Check every 2s if the URL changed away from a valid meet code.
    setInterval(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastKnownUrl) {
            console.log(`${LOG_PREFIX} URL changed: ${lastKnownUrl} -> ${currentUrl}`);
            lastKnownUrl = currentUrl;

            if (meetDetected && !hasValidMeetUrl()) {
                console.log(`${LOG_PREFIX} URL no longer a valid meet code, ending call`);
                notifyMeetEnded();
            } else if (!meetDetected && hasValidMeetUrl()) {
                // URL changed to a new meet code - schedule a check
                scheduleCheck('url-change');
            }
        }
    }, 2000);

    console.log(`${LOG_PREFIX} meet observer started (mutation + heartbeat + url-watch)`);
}

// ============================================================
// LISTENER DE MENSAGENS DO BACKGROUND
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const action = request.type || request.action;

    if (action === 'recordingStarted') {
        updateBadge('recording');
        startTranscription(); // Inicia Web Speech API
        sendResponse({ success: true });
    } else if (action === 'recordingStopped') {
        updateBadge('processing');
        stopTranscription(); // Para Web Speech API
        setTimeout(() => updateBadge('idle'), 5000);
        sendResponse({ success: true });
    } else if (action === 'GET_MEET_INFO') {
        sendResponse(getMeetInfo());
    } else if (action === 'PING_MEET_STATUS') {
        // Background pergunta se a call acabou (orphan check)
        const ended = isMeetDefinitelyEnded();
        console.log(`${LOG_PREFIX} PING_MEET_STATUS: ended=${ended}, meetDetected=${meetDetected}`);
        sendResponse({ ended, meetDetected });
    } else if (action === 'GET_TRANSCRIPT') {
        // Background pede o transcript acumulado pelo Web Speech API
        const transcript = stopTranscription();
        sendResponse({ transcript });
    }
});

// ============================================================
// DETECCAO DE SAIDA DA PAGINA
// Quando o usuario sai da call, o Meet pode navegar para outra pagina
// ou fechar o tab. O MutationObserver nao sobrevive a navegacao.
// O beforeunload garante que o background receba MEET_ENDED.
// ============================================================

window.addEventListener('beforeunload', () => {
    if (meetDetected) {
        // Usa sendMessage sincrono - pode nao chegar se o SW estiver dormindo,
        // mas e a melhor chance que temos antes do unload.
        try {
            chrome.runtime.sendMessage({ type: 'MEET_ENDED' });
        } catch (_) {
            // Extensao pode ter sido desconectada - ignorar
        }
    }
});

// Fallback: visibilitychange com hidden pode indicar que o tab foi fechado
// IMPORTANTE: Usa isMeetDefinitelyEnded() - NAO isMeetingActive().
// Quando o usuario abre o popup ou troca de tab, o Meet tab fica hidden
// mas a call continua ativa. Nao podemos parar so porque seletores sumiram.
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && meetDetected) {
        // Espera 5s para o tab estabilizar, depois verifica com logica DEFINITIVA
        setTimeout(() => {
            if (meetDetected && isMeetDefinitelyEnded()) {
                console.log(`${LOG_PREFIX} visibilitychange: call ended definitively while tab hidden`);
                notifyMeetEnded();
            }
        }, 5000);
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
