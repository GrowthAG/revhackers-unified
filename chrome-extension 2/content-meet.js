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
// BADGE & FLOATING PILL DE STATUS (NOTION STYLE)
// ============================================================

let badgeEl = null;
let badgeState = 'idle'; // 'idle' | 'recording' | 'processing'

function createBadge() {
    if (badgeEl) return;

    badgeEl = document.createElement('div');
    badgeEl.id = 'revhackers-meet-badge';
    badgeEl.setAttribute('data-state', 'idle');

    // Estilos inline de contêiner da Pílula Flutuante
    Object.assign(badgeEl.style, {
        position: 'fixed',
        top: '24px',          // Agora no topo
        left: '50%',
        transform: 'translateX(-50%)', // Centralizado
        zIndex: '2147483647',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 10px 10px 16px',
        background: '#1F1F1F',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '100px', // Totalmente arredondado
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto', // Permite clique!
    });

    // 1. Ícone / Logo do lado esquerdo
    const iconWrapper = document.createElement('div');
    Object.assign(iconWrapper.style, {
        width: '32px', height: '32px',
        background: '#2A2A2A',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: '0', border: '1px solid rgba(255,255,255,0.1)'
    });
    // Trocando o SVG Genérico pela imagem local gerada (letra R) da extensão
    iconWrapper.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon48.png')}" style="width:20px;height:20px;border-radius:2px;object-fit:contain;" />`;

    // 2. Textos do Meio
    const textWrapper = document.createElement('div');
    textWrapper.id = 'revhackers-meet-texts';
    Object.assign(textWrapper.style, {
        display: 'flex', flexDirection: 'column', gap: '2px'
    });
    
    const titleLabel = document.createElement('span');
    titleLabel.id = 'revhackers-meet-title';
    titleLabel.textContent = 'Iniciar RevNotes AI';
    Object.assign(titleLabel.style, {
        color: '#FFFFFF', fontSize: '14px', fontWeight: '600', letterSpacing: '-0.01em', lineHeight: '1'
    });

    const subLabel = document.createElement('span');
    subLabel.id = 'revhackers-meet-sub';
    subLabel.textContent = 'A transcrição abre o Hub';
    Object.assign(subLabel.style, {
        color: '#A1A1AA', fontSize: '12px', fontWeight: '400', lineHeight: '1'
    });

    textWrapper.appendChild(titleLabel);
    textWrapper.appendChild(subLabel);

    // 3. Botão de Ação Mestre (Notion Style)
    const actionBtn = document.createElement('button');
    actionBtn.id = 'revhackers-meet-btn';
    actionBtn.textContent = 'Gravar Reunião';
    Object.assign(actionBtn.style, {
        background: '#FFFFFF', // Clean White like Notion
        color: '#000000',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.15s ease',
        display: 'flex', alignItems: 'center', gap: '6px',
        outline: 'none',
        whiteSpace: 'nowrap'
    });
    
    // 4. Botão [X] Fechar (Pedido do Diretor - Minimalismo)
    const closeBtn = document.createElement('button');
    closeBtn.id = 'revhackers-meet-close';
    closeBtn.innerHTML = '&#x2715;'; // X symol
    Object.assign(closeBtn.style, {
        background: 'transparent',
        color: '#A1A1AA',
        border: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px',
        marginLeft: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        outline: 'none',
        transition: 'color 0.2s'
    });
    closeBtn.onmouseover = () => closeBtn.style.color = '#FFFFFF';
    closeBtn.onmouseout = () => closeBtn.style.color = '#A1A1AA';
    
    closeBtn.addEventListener('click', () => {
        // Oculta a pílula da tela para limpar o visual
        badgeEl.style.display = 'none';
    });
    
    // Hover no botão mestre
    actionBtn.onmouseover = () => {
        if(badgeState === 'idle') actionBtn.style.background = '#F3F4F6';
    };
    actionBtn.onmouseout = () => {
        if(badgeState === 'idle') actionBtn.style.background = '#FFFFFF';
    };
    
    // 5. Lógica de Clique Direto na Tela (Driblando tabCapture com desktopCapture)
    actionBtn.addEventListener('click', () => {
        if(badgeState === 'idle') {
            const originalText = actionBtn.innerHTML;
            actionBtn.innerHTML = '🕒 Aguardando Permissão...';
            actionBtn.style.background = '#F3F4F6';
            actionBtn.style.color = '#000000';
            
            // Dispara START_RECORDING_NATIVE (acorda DesktopCapture)
            chrome.runtime.sendMessage({ action: 'START_RECORDING_NATIVE' }, (res) => {
                if (!res || !res.success) {
                    actionBtn.innerHTML = '❌ Cancelado ou Erro';
                    actionBtn.style.background = '#FEE2E2';
                    actionBtn.style.color = '#B91C1C';
                    setTimeout(() => {
                        if (badgeState === 'idle') {
                            actionBtn.innerHTML = originalText;
                            actionBtn.style.background = '#FFFFFF';
                            actionBtn.style.color = '#000000';
                        }
                    }, 4000);
                }
                // Se success for true, o badge receberá updateBadge('recording') do webhook do background!
            });
        }
        else if(badgeState === 'recording') {
            actionBtn.textContent = 'Parando...';
            chrome.runtime.sendMessage({ action: 'stopRecording' });
        }
    });

    // Montar DOM
    badgeEl.appendChild(iconWrapper);
    badgeEl.appendChild(textWrapper);
    badgeEl.appendChild(actionBtn);
    badgeEl.appendChild(closeBtn); // Adicionando o X ao final da pill
    document.body.appendChild(badgeEl);
    
    injectBlinkKeyframe();

    console.log(`${LOG_PREFIX} floating notion-style pill created`);
}

function updateBadge(state) {
    if (!badgeEl) createBadge();

    badgeState = state;
    
    const titleLabel = document.getElementById('revhackers-meet-title');
    const subLabel = document.getElementById('revhackers-meet-sub');
    const actionBtn = document.getElementById('revhackers-meet-btn');

    if (!titleLabel || !subLabel || !actionBtn) return;

    if (state === 'recording') {
        // Encolhe a pílula para modo "Gravando" (menos intrusivo)
        badgeEl.style.padding = '8px 16px';
        titleLabel.textContent = 'Gravando reunião';
        titleLabel.style.color = '#ff4444';
        titleLabel.style.animation = 'revhackers-blink 1.5s infinite';
        subLabel.style.display = 'none'; // Esconde o texto menor
        
        actionBtn.style.display = 'flex';
        actionBtn.style.background = '#3F3F46'; // Cinza Escuro
        actionBtn.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#ff4444;"></span> Parar';
        actionBtn.onmouseover = () => actionBtn.style.background = '#27272A';
        actionBtn.onmouseout = () => actionBtn.style.background = '#3F3F46';
        
    } else if (state === 'processing') {
        badgeEl.style.padding = '8px 16px';
        titleLabel.textContent = 'Processando IA...';
        titleLabel.style.color = '#00CC6A';
        titleLabel.style.animation = 'none';
        subLabel.style.display = 'none';
        
        actionBtn.style.display = 'none'; // Esconde botão enquanto processa
        
    } else {
        // IDLE
        badgeEl.style.padding = '10px 10px 10px 16px';
        titleLabel.textContent = 'Iniciar RevNotes AI';
        titleLabel.style.color = '#FFFFFF';
        titleLabel.style.animation = 'none';
        subLabel.style.display = 'block';
        
        actionBtn.style.display = 'flex';
        actionBtn.style.background = '#FFFFFF';
        actionBtn.style.color = '#000000';
        actionBtn.innerHTML = 'Gravar Reunião';
        actionBtn.onmouseover = () => actionBtn.style.background = '#F3F4F6';
        actionBtn.onmouseout = () => actionBtn.style.background = '#FFFFFF';
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
    'button[aria-label*="Rejoin" i]',   // Rejoin button = call already ended
    'button[aria-label*="Reentrar" i]', // PT-BR rejoin
];

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

    return false;
}

/**
 * Detecta se o usuario entrou em uma call ativa (para o MEET_DETECTED inicial).
 * Usa seletores amplos - basta UM match para considerar ativo.
 */
function isMeetingActive() {
    if (!hasValidMeetUrl()) return false;

    // Qualquer seletor ativo 
    const hasActive = MEET_ACTIVE_SELECTORS.some(sel => {
        try { return document.querySelector(sel) !== null; } catch (_) { return false; }
    });

    return hasActive;
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
