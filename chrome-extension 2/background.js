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

import { ENDPOINTS, SUPABASE_ANON_KEY, SUPABASE_URL } from './config.js';

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
            const targetTabId = request.tabId || sender.tab?.id;
            handleStartRecording(targetTabId)
                .then(() => sendResponse({ success: true }))
                .catch(err => {
                    console.error(`${LOG_PREFIX} START_RECORDING error:`, err.message);
                    sendResponse({ success: false, error: err.message });
                });
            return true; // Manter canal aberto para resposta assincrona

        case 'START_RECORDING_NATIVE':
            const sourceTab = sender.tab;
            if (!sourceTab) {
                sendResponse({ success: false, error: 'Apenas funciona dentro de uma aba ativa' });
                return true;
            }
            
            // Usamos desktopCapture para burlar a restrição de user_gesture do tabCapture
            // Isso abrirá o prompt nativo do Chrome para o usuário.
            chrome.desktopCapture.chooseDesktopMedia(['tab', 'audio'], sourceTab, async (streamId) => {
                if (!streamId) {
                    sendResponse({ success: false, error: 'Cancelado pelo usuário. Selecione a aba atual e clique em Partilhar.' });
                    return;
                }
                
                try {
                    await handleStartRecording(sourceTab.id, streamId);
                    // O success=true diz para o botão atualizar
                    sendResponse({ success: true });
                } catch(err) {
                    sendResponse({ success: false, error: err.message });
                }
            });
            return true;

        case 'STOP_RECORDING':
        case 'stopRecording':
            // Recuperar tabId ANTES de parar (o stop limpa o storage)
            chrome.storage.local.get(['recordingTabId', 'selectedProjectId'], (stored) => {
                const tabId = stored.recordingTabId;
                const projectId = stored.selectedProjectId || null;

                handleStopRecording()
                    .then(async (payload) => {
                        if (payload?.audioBlob) {
                            // FAST TRACK: Nuvem Inteligente e Transcrição
                            uploadMeetingAudio(payload.audioBlob, tabId, projectId).then((recordingId) => {
                                // HEAVY TRACK: Arquivo de vídeo bruto para o Storage
                                if (payload.videoBlob && recordingId) {
                                    uploadMeetingVideo(payload.videoBlob, recordingId);
                                }
                            });
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
            chrome.storage.local.remove(['userJwt', 'userEmail', 'refreshToken', 'tokenExpiresAt'], () => {
                console.log(`${LOG_PREFIX} auth token and refresh token cleared`);
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

            // Auto-gravar OU notificar o usuario
            chrome.storage.local.get(['recordingState', 'autoRecord'], (stored) => {
                if (stored.recordingState === 'recording') return; // Ja gravando

                if (stored.autoRecord) {
                    // Auto-record ativado: inicia gravacao automaticamente
                    console.log(`${LOG_PREFIX} auto-record enabled, starting recording for tab ${sender.tab?.id}`);
                    showMeetNotification('RevHackers detectou uma call. Gravando automaticamente.');
                    if (sender.tab?.id) {
                        handleStartRecording(sender.tab.id)
                            .catch(err => {
                                console.error(`${LOG_PREFIX} auto-record failed:`, err.message);
                                showNotification('Erro na gravacao automatica', err.message);
                            });
                    }
                } else {
                    // Notifica o usuario que uma call foi detectada - clique abre o popup
                    showMeetNotification('RevHackers detectou uma call. Clique para gravar.');
                }
            });

            sendResponse({ success: true });
            return true;

        case 'MEET_ENDED':
            // IMPORTANTE: sendResponse e chamado DENTRO do callback para poder
            // informar o content script se o MEET_ENDED foi aceito ou rejeitado.
            chrome.storage.local.get(['recordingState', 'recordingTabId', 'selectedProjectId', 'recordingStartTime'], (stored) => {
                console.log(`${LOG_PREFIX} meet ended signal received`);

                if (stored.recordingState === 'recording') {
                    // GRACE PERIOD: Rejeita MEET_ENDED nos primeiros 15 segundos.
                    // O content script recebe accepted=false e continua monitorando.
                    const elapsed = Date.now() - (stored.recordingStartTime || 0);
                    if (elapsed < 15000) {
                        console.log(`${LOG_PREFIX} MEET_ENDED REJEITADO (grace period: ${Math.round(elapsed / 1000)}s < 15s). Content script continuara monitorando.`);
                        sendResponse({ success: true, accepted: false, reason: 'grace_period' });
                        return;
                    }

                    console.log(`${LOG_PREFIX} MEET_ENDED ACEITO - auto-stopping recording (elapsed: ${Math.round(elapsed / 1000)}s)`);
                    chrome.storage.local.set({ meetActive: false });
                    const projectId = stored.selectedProjectId || null;
                    const tabId = stored.recordingTabId;

                    handleStopRecording()
                        .then(async (payload) => {
                            if (payload?.audioBlob) {
                                uploadMeetingAudio(payload.audioBlob, tabId, projectId).then((recordingId) => {
                                    if (payload.videoBlob && recordingId) {
                                        uploadMeetingVideo(payload.videoBlob, recordingId);
                                    }
                                });
                            }
                            showNotification('Gravacao finalizada', 'A reuniao terminou. Audio sendo transcrito automaticamente.');
                        })
                        .catch(err => {
                            console.error(`${LOG_PREFIX} auto-stop error:`, err.message);
                        });

                    sendResponse({ success: true, accepted: true });
                } else {
                    // Nao estava gravando - aceitar normalmente
                    chrome.storage.local.set({ meetActive: false });
                    sendResponse({ success: true, accepted: true });
                }
            });
            return true; // Manter canal aberto para sendResponse assincrono

        default:
            // Mensagens legadas do content.js original (compatibilidade)
            return false;
    }
});

// ============================================================
// SAFETY NET: Multiple layers to detect when Meet call ends
// Layer 1: tabs.onUpdated - URL changes away from meet
// Layer 2: tabs.onRemoved - tab closed
// Layer 3: Alarm-based orphan check - periodic verification
// ============================================================

/**
 * Helper: stops recording and uploads, with logging.
 * Centralizes the stop-and-upload pattern used by all safety nets.
 */
async function safetyNetStop(reason, tabId, projectId) {
    // GRACE PERIOD: Ignora safety net nos primeiros 15 segundos de gravacao.
    // Exceto para "Tab fechado" e "Tab nao existe" que sao definitivos.
    const isDefinitive = reason.includes('fechado') || reason.includes('nao existe');
    if (!isDefinitive) {
        const stored = await getStorageValues(['recordingStartTime']);
        const elapsed = Date.now() - (stored.recordingStartTime || 0);
        if (elapsed < 15000) {
            console.log(`${LOG_PREFIX} [safety-net] IGNORADO (grace period: ${Math.round(elapsed / 1000)}s < 15s): ${reason}`);
            return;
        }
    }

    console.log(`${LOG_PREFIX} [safety-net] auto-stopping recording. Reason: ${reason}`);
    try {
        const payload = await handleStopRecording();
        if (payload?.audioBlob) {
            uploadMeetingAudio(payload.audioBlob, tabId, projectId).then((recordingId) => {
                if (payload.videoBlob && recordingId) {
                    uploadMeetingVideo(payload.videoBlob, recordingId);
                }
            });
        }
        showNotification('Gravacao finalizada', `${reason}. Audio sendo processado.`);
    } catch (err) {
        console.error(`${LOG_PREFIX} [safety-net] stop error (${reason}):`, err.message);
    }
}

// Layer 1: Tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === 'loading') {
        chrome.storage.local.get(['recordingState', 'recordingTabId', 'selectedProjectId'], (stored) => {
            if (stored.recordingState !== 'recording') return;
            if (stored.recordingTabId !== tabId) return;

            const newUrl = changeInfo.url || '';
            const isMeetCall = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(newUrl);

            if (!isMeetCall && changeInfo.url) {
                safetyNetStop('Tab navegou para fora do Meet', tabId, stored.selectedProjectId || null);
            }
        });
    }
});

// Layer 2: Tab closed
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.get(['recordingState', 'recordingTabId', 'selectedProjectId'], (stored) => {
        if (stored.recordingState === 'recording' && stored.recordingTabId === tabId) {
            safetyNetStop('Tab do Meet foi fechado', tabId, stored.selectedProjectId || null);
        }
    });
});

// Layer 3: Alarm-based orphan recording check
// Every 30 seconds, verify the recording tab still exists and is on a Meet URL.
// This catches edge cases where both content-meet.js and the tab listeners fail.
chrome.alarms.create('recording-orphan-check', { periodInMinutes: 0.5 });

async function checkForOrphanedRecording() {
    const stored = await getStorageValues(['recordingState', 'recordingTabId', 'selectedProjectId', 'recordingStartTime']);
    if (stored.recordingState !== 'recording') return;

    const tabId = stored.recordingTabId;
    console.log(`${LOG_PREFIX} [orphan-check] verifying tab ${tabId}...`);

    // Check 1: Does the tab still exist?
    try {
        const tab = await chrome.tabs.get(tabId);
        const isMeetCall = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(tab.url || '');

        if (!isMeetCall) {
            console.log(`${LOG_PREFIX} [orphan-check] tab ${tabId} no longer on Meet URL: ${tab.url}`);
            safetyNetStop('Tab nao esta mais no Meet', tabId, stored.selectedProjectId || null);
            return;
        }

        // Check 2: Ping content script to see if meet definitively ended
        try {
            const status = await chrome.tabs.sendMessage(tabId, { type: 'PING_MEET_STATUS' });
            if (status && status.ended === true) {
                console.log(`${LOG_PREFIX} [orphan-check] content script confirms call ENDED`);
                safetyNetStop('Content script confirmou que a call acabou', tabId, stored.selectedProjectId || null);
                return;
            }
            // Content script says call not ended - continue recording
        } catch (e) {
            // Content script not responding - may have been unloaded
            console.warn(`${LOG_PREFIX} [orphan-check] content script not responding on tab ${tabId}: ${e.message}`);
        }

    } catch (e) {
        // Tab no longer exists
        console.log(`${LOG_PREFIX} [orphan-check] tab ${tabId} no longer exists`);
        safetyNetStop('Tab de gravacao nao existe mais', tabId, stored.selectedProjectId || null);
        return;
    }

    // Check 3: Max recording duration safety (3 hours)
    const maxDuration = 3 * 60 * 60 * 1000;
    const elapsed = Date.now() - (stored.recordingStartTime || Date.now());
    if (elapsed > maxDuration) {
        console.log(`${LOG_PREFIX} [orphan-check] recording exceeded max duration (${Math.round(elapsed / 60000)} min)`);
        safetyNetStop('Gravacao excedeu duracao maxima (3h)', tabId, stored.selectedProjectId || null);
    }
}

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
        reasons: ['USER_MEDIA', 'DISPLAY_MEDIA'],
        justification: 'Gravacao de tela e audio do tab Google Meet para transcricao',
    });

    await _offscreenCreating;
    _offscreenCreating = null;
}

// ============================================================
// INICIO DA GRAVACAO
// ============================================================

async function handleStartRecording(tabId, providedStreamId = null) {
    await ensureOffscreenDocument();

    let streamId = providedStreamId;

    // Obtém stream ID do tab alvo via tabCapture apenas se não veio do prompt nativo
    if (!streamId) {
        streamId = await new Promise((resolve, reject) => {
            chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (id) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (!id) {
                    reject(new Error('Nenhum Stream ID retornado pelo chrome.tabCapture.'));
                } else {
                    resolve(id);
                }
            });
        });
    }

    // Inicia captura no Offscreen Document
    const offscreenRes = await chrome.runtime.sendMessage({
        target: 'offscreen',
        action: 'startCapture',
        streamId: streamId,
        sourceType: providedStreamId ? 'desktop' : 'tab'
    });

    if (offscreenRes && !offscreenRes.success) {
        throw new Error('Motor falhou ao iniciar a camera: ' + offscreenRes.error);
    }

    // Persiste estado corretamente apenas se sucesso absoluto
    await chrome.storage.local.set({
        recordingState: 'recording',
        recordingTabId: tabId,
        recordingStartTime: Date.now(),
    });

    // Avisa content-meet.js que a gravação começou
    chrome.tabs.sendMessage(tabId, { type: 'recordingStarted' }).catch(() => {});

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
        const payload = await chrome.runtime.sendMessage({
            target: 'offscreen',
            action: 'stopCapture',
        });

        let realAudioBlob = null;
        let realVideoBlob = null;

        // O offscreen document agora envia os dados como base64 strings
        // em vez de blob: URLs (que nao sobrevivem entre contextos).
        if (payload?.audioBase64) {
            try {
                realAudioBlob = base64ToBlob(payload.audioBase64, payload.audioType || 'audio/webm');
                console.log(`${LOG_PREFIX} audio blob reconstructed: ${realAudioBlob.size} bytes`);

                if (payload.videoBase64) {
                    realVideoBlob = base64ToBlob(payload.videoBase64, payload.videoType || 'video/webm');
                    console.log(`${LOG_PREFIX} video blob reconstructed: ${realVideoBlob.size} bytes`);
                }
            } catch (e) {
                console.error(`${LOG_PREFIX} base64 decode error:`, e.message);
                chrome.storage.local.set({ lastUploadMsg: `Blob decode error: ${e.message}` });
            }
        }

        // Fecha o Offscreen Document para liberar recursos da camera
        try {
            await chrome.offscreen.closeDocument();
        } catch (e) {
            // Pode falhar se ja foi fechado - ignorar
        }

        // Limpa estado
        chrome.action.setBadgeText({ text: '' });
        const stored = await chrome.storage.local.get(['recordingTabId']);
        const oldTabId = stored.recordingTabId;
        await chrome.storage.local.remove(['recordingState', 'recordingTabId', 'recordingStartTime']);

        if (oldTabId) {
             chrome.tabs.sendMessage(oldTabId, { type: 'recordingStopped' }).catch(() => {});
        }

        console.log(`${LOG_PREFIX} recording stopped. Audio: ${realAudioBlob?.size || 0}b, Video: ${realVideoBlob?.size || 0}b`);
        return { audioBlob: realAudioBlob, videoBlob: realVideoBlob };

    } catch (err) {
        // Forca limpeza mesmo em caso de erro fatal no runtime sendMessage
        chrome.action.setBadgeText({ text: '' });
        await chrome.storage.local.remove(['recordingState', 'recordingTabId', 'recordingStartTime']);
        throw err;
    }
}

// ============================================================
// UPLOAD DO AUDIO PARA process-meeting-audio
// Envia como multipart/form-data com os campos esperados pela Edge Function.
// ============================================================

/**
 * Tenta obter o transcript do Web Speech API do content-meet.js
 * Retorna string vazia se nao conseguir (fallback para Whisper na edge function)
 */
async function getTranscriptFromContentScript(tabId) {
    if (!tabId) return '';
    try {
        const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_TRANSCRIPT' });
        const transcript = response?.transcript || '';
        console.log(`${LOG_PREFIX} Web Speech transcript: ${transcript.length} chars`);
        return transcript;
    } catch (e) {
        console.warn(`${LOG_PREFIX} could not get transcript from content script:`, e.message);
        return '';
    }
}

async function uploadMeetingAudio(audioBlob, tabId, projectId) {
    console.log(`${LOG_PREFIX} starting upload, audio size: ${audioBlob.size} bytes`);

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

        // Tenta obter transcript do Web Speech API (gratis, tempo real)
        const webSpeechTranscript = await getTranscriptFromContentScript(tabId);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('meetUrl', meetUrl);
        formData.append('meetTitle', meetTitle);
        formData.append('recordedAt', new Date().toISOString());

        // Se temos transcript do Web Speech API, envia junto - edge function pula Whisper
        if (webSpeechTranscript && webSpeechTranscript.length > 50) {
            formData.append('transcript', webSpeechTranscript);
            console.log(`${LOG_PREFIX} sending Web Speech transcript (${webSpeechTranscript.length} chars) - Whisper sera pulado`);
        }

        if (projectId) {
            formData.append('projectId', projectId);
            console.log(`${LOG_PREFIX} upload linked to projectId: ${projectId}`);
        }

        showNotification('Processando...', webSpeechTranscript.length > 50
            ? `Enviando transcricao local: "${meetTitle}"`
            : `Enviando audio para transcricao: "${meetTitle}"`
        );

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
            chrome.storage.local.set({ lastUploadMsg: `✔ Processada! (ID: ${result.recordingId})` });
            return result.recordingId;
        } else {
            const errMsg = result.error || `HTTP ${response.status}`;
            console.error(`${LOG_PREFIX} upload failed: ${errMsg}`);
            showNotification('Erro no upload', errMsg);
            chrome.storage.local.set({ lastUploadMsg: `❌ Erro Servidor: ${errMsg}` });
        }

    } catch (err) {
        console.error(`${LOG_PREFIX} uploadMeetingAudio error:`, err.message);
        showNotification('Erro ao enviar audio', err.message);
        chrome.storage.local.set({ lastUploadMsg: `❌ Falha Local: ${err.message}` });
    }
    return null;
}

// ============================================================
// UPLOAD DO VÍDEO DIRETO PARA O SUPABASE STORAGE (HEAVY TRACK)
// Desvia da Edge Function por limite de payload e sobe bruto (REST).
// ============================================================

async function uploadMeetingVideo(videoBlob, recordingId) {
    console.log(`${LOG_PREFIX} starting BACKGROUND video upload, size: ${videoBlob.size} bytes`);
    
    try {
        const { userJwt } = await getStorageValues(['userJwt']);
        if (!userJwt) return;

        const fileName = `meet_${recordingId}_${Date.now()}.webm`;
        
        showNotification('Cofre Visual', 'O video (tela) da reuniao esta sendo enviado em background. Pode continuar usando a maquina...');

        // 1. Envio massivo Bypass (Storage REST API)
        const uploadRes = await fetch(`${ENDPOINTS.MEET_VIDEOS_STORAGE}/${fileName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userJwt}`,
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'video/webm',
            },
            body: videoBlob
        });

        if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${fileName}: HTTP ${uploadRes.status}`);
        }

        console.log(`${LOG_PREFIX} Video brute uploaded: meet_videos/${fileName}`);
        
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/meet_videos/${fileName}`;

        // 2. Amarrar a URL do vídeo público no registro gerado pela IA (via REST API)
        const patchRes = await fetch(`${ENDPOINTS.MEETING_RECORDINGS_REST}?id=eq.${recordingId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${userJwt}`,
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ video_url: publicUrl })
        });

        if (!patchRes.ok) {
            throw new Error(`Failed to attach URL to record ${recordingId}`);
        }

        console.log(`${LOG_PREFIX} Record ${recordingId} linked with remote video URL!`);
        showNotification('Gravacao Salva', 'Todas as midias em video ja estao seguras no Hub.');

    } catch (e) {
        console.error(`${LOG_PREFIX} Heavy Track Failure:`, e.message);
        showNotification('Aviso no Video', `O envio do video falhou (${e.message}), mas o audio ja esta salvo.`);
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
 * Reconstroi um Blob a partir de uma string base64 pura.
 * Usado para receber dados do offscreen document sem depender de blob: URLs
 * que sao invalidadas quando o contexto de origem e destruido.
 */
function base64ToBlob(base64, mimeType) {
    const byteChars = atob(base64);
    const byteArrays = [];
    // Processa em fatias de 512 bytes para evitar estouro de stack
    for (let offset = 0; offset < byteChars.length; offset += 512) {
        const slice = byteChars.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
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

/**
 * Notificacao especifica de deteccao de Meet.
 * Clicavel - abre o popup da extensao.
 */
const MEET_NOTIF_ID = 'revhackers-meet-detected';

function showMeetNotification(message) {
    chrome.notifications.create(MEET_NOTIF_ID, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'RevHackers Clipper',
        message: message,
    });
}

chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === MEET_NOTIF_ID) {
        chrome.notifications.clear(MEET_NOTIF_ID);
        // Abre o popup abrindo a extensao action
        chrome.action.openPopup().catch(() => {
            // openPopup pode falhar em alguns contextos - fallback silencioso
            console.warn(`${LOG_PREFIX} could not open popup from notification click`);
        });
    }
});

// ============================================================
// AUTO-REFRESH JWT EM BACKGROUND
// Renova o token automaticamente a cada 50 min (token dura 1h)
// para que o usuario nunca precise fazer login de novo.
// ============================================================

async function refreshJwtInBackground() {
    try {
        const stored = await getStorageValues(['refreshToken', 'tokenExpiresAt', 'userJwt']);
        if (!stored.refreshToken) return; // Nao logado

        const fiveMinutes = 5 * 60 * 1000;
        const expiresAt = stored.tokenExpiresAt || 0;

        // So renova se faltam menos de 5 minutos
        if (Date.now() < (expiresAt - fiveMinutes)) return;

        console.log(`${LOG_PREFIX} auto-refreshing JWT in background...`);

        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ refresh_token: stored.refreshToken }),
        });

        const data = await res.json();

        if (res.ok && data.access_token) {
            await chrome.storage.local.set({
                userJwt: data.access_token,
                userEmail: data.user?.email || '',
                refreshToken: data.refresh_token,
                tokenExpiresAt: Date.now() + (data.expires_in * 1000),
            });
            console.log(`${LOG_PREFIX} JWT refreshed successfully, expires in ${data.expires_in}s`);
        } else {
            console.warn(`${LOG_PREFIX} JWT refresh failed:`, data.error_description || data.error);
        }
    } catch (e) {
        console.error(`${LOG_PREFIX} JWT refresh error:`, e.message);
    }
}

// Refresh a cada 50 minutos via alarm (sobrevive ao SW ser terminado)
chrome.alarms.create('jwt-refresh', { periodInMinutes: 50 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'jwt-refresh') {
        refreshJwtInBackground();
    } else if (alarm.name === 'recording-orphan-check') {
        checkForOrphanedRecording();
    }
});

// Tambem tenta refresh quando o SW acorda (ex: apos fechar e abrir Chrome)
refreshJwtInBackground();
