/**
 * RevHackers Clipper - Offscreen Document
 *
 * Este documento roda em um contexto separado com acesso ao MediaRecorder
 * e ao getUserMedia (o Service Worker nao tem acesso a essas APIs).
 *
 * Fluxo:
 * 1. background.js cria este documento via chrome.offscreen.createDocument
 * 2. background.js envia mensagem 'startCapture' com o streamId do tab
 * 3. Este documento captura o audio e armazena os chunks
 * 4. Ao receber 'stopCapture', monta o Blob e retorna para o background
 * 5. background.js fecha este documento e faz o upload
 */

const LOG_PREFIX = '[revhackers-ext]';

let audioRecorder = null;
let videoRecorder = null;
let audioChunks   = [];
let videoChunks   = [];

// ============================================================
// LISTENER DE MENSAGENS DO BACKGROUND
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target !== 'offscreen') return false;

    if (request.action === 'startCapture') {
        startCapture(request.streamId, request.sourceType || 'tab')
            .then(() => sendResponse({ success: true }))
            .catch(err => {
                console.error(`${LOG_PREFIX} offscreen startCapture error:`, err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (request.action === 'stopCapture') {
        stopCapture()
            .then(async (payload) => {
                // Convert blobs to base64 strings so they survive the
                // cross-context sendResponse serialization. blob: URLs
                // are scoped to this offscreen document and cannot be
                // fetched by the service worker reliably.
                let audioBase64 = null;
                let videoBase64 = null;

                if (payload.audioBlob && payload.audioBlob.size > 0) {
                    audioBase64 = await blobToBase64(payload.audioBlob);
                    console.log(`${LOG_PREFIX} audio encoded to base64, length: ${audioBase64.length}`);
                }

                if (payload.videoBlob && payload.videoBlob.size > 0) {
                    videoBase64 = await blobToBase64(payload.videoBlob);
                    console.log(`${LOG_PREFIX} video encoded to base64, length: ${videoBase64.length}`);
                }

                sendResponse({
                    success: true,
                    audioBase64,
                    audioType: payload.audioBlob?.type || 'audio/webm',
                    videoBase64,
                    videoType: payload.videoBlob?.type || 'video/webm',
                });
            })
            .catch(err => {
                console.error(`${LOG_PREFIX} offscreen stopCapture error:`, err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    return false;
});

// ============================================================
// INICIO DA CAPTURA
// ============================================================

async function startCapture(streamId, sourceType) {
    audioChunks = [];
    videoChunks = [];

    // OBTÉM STREAM PELA FONTE IDENTIFICADA (Pode ser 'tab' ou 'desktop')
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: sourceType,
                chromeMediaSourceId: streamId,
            },
        },
        video: {
            mandatory: {
                chromeMediaSource: sourceType,
                chromeMediaSourceId: streamId,
            }
        }
    });

    // ISOLAMENTOS DOS TRACKS: Clonando apenas o áudio para a Fast Track!
    const audioTrack = stream.getAudioTracks()[0];
    const audioStream = new MediaStream([audioTrack]);

    // MOTOR 1: THE FAST TRACK (O Cerebro da OpenAI)
    const audioMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    audioRecorder = new MediaRecorder(audioStream, { mimeType: audioMime, audioBitsPerSecond: 128000 });
    audioRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    audioRecorder.onerror = (e) => {
        console.error(`${LOG_PREFIX} AUDIO MediaRecorder ERROR:`, e.error?.name, e.error?.message);
    };
    audioRecorder.start(1000);

    // MOTOR 2: THE HEAVY TRACK (O Arquivamento de Tela/Video)
    const videoMime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
    videoRecorder = new MediaRecorder(stream, { mimeType: videoMime });
    videoRecorder.ondataavailable = (e) => { if (e.data.size > 0) videoChunks.push(e.data); };
    videoRecorder.onerror = (e) => {
        console.error(`${LOG_PREFIX} VIDEO MediaRecorder ERROR:`, e.error?.name, e.error?.message);
    };
    videoRecorder.start(1000);

    // Monitora track endings - se a track morrer prematuramente, loga mas NAO para a gravacao.
    // O background.js decide quando parar via MEET_ENDED ou safety net.
    audioTrack.addEventListener('ended', () => {
        console.warn(`${LOG_PREFIX} AUDIO TRACK ENDED prematuramente! recorder state: ${audioRecorder?.state}`);
    });
    stream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
            console.warn(`${LOG_PREFIX} VIDEO TRACK ENDED prematuramente! recorder state: ${videoRecorder?.state}`);
        });
    });

    // Roteia o audio de volta para os alto-falantes para que o usuario continue ouvindo
    try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(audioContext.destination);
    } catch (e) {
        console.warn(`${LOG_PREFIX} could not route audio to speakers:`, e.message);
    }

    console.log(`${LOG_PREFIX} DUPLO offscreen capture started! Audio: ${audioMime} | Video: ${videoMime}`);
}

// ============================================================
// PARADA DA CAPTURA
// Retorna um Blob com o audio completo.
// ============================================================

async function stopCapture() {
    return new Promise((resolve, reject) => {
        if (!audioRecorder || !videoRecorder) {
            reject(new Error('Nenhuma gravacao dupla ativa no offscreen document'));
            return;
        }

        let audioBlob = null;
        let videoBlob = null;

        let stoppedCount = 0;
        
        const checkDone = () => {
            stoppedCount++;
            if (stoppedCount === 2) {
                // Para todas as tracks para liberar o microfone/tab audio (encerra as luzes piscando)
                try {
                    videoRecorder.stream.getTracks().forEach(track => track.stop());
                } catch (e) { /* ignorar */ }

                audioRecorder = null;
                videoRecorder = null;
                
                resolve({ audioBlob, videoBlob });
            }
        };

        // Escutar as paradas do Audio
        audioRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];
            console.log(`${LOG_PREFIX} offscreen AUDIO capture stopped, size: ${audioBlob.size} bytes`);
            checkDone();
        };

        // Escutar as paradas do Vídeo
        videoRecorder.onstop = () => {
            videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            videoChunks = [];
            console.log(`${LOG_PREFIX} offscreen VIDEO capture stopped, size: ${videoBlob.size} bytes`);
            checkDone();
        };

        audioRecorder.stop();
        videoRecorder.stop();
    });
}

// ============================================================
// UTILITARIOS
// ============================================================

/**
 * Converte um Blob em uma string base64 pura (sem o prefixo data:...).
 * Isso permite enviar os dados via sendResponse, que serializa como JSON.
 * blob: URLs nao sobrevivem entre contextos (offscreen -> service worker).
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // result e "data:<mime>;base64,XXXX" - extraimos so o XXXX
            const base64 = reader.result.split(',')[1] || '';
            resolve(base64);
        };
        reader.onerror = () => reject(new Error('FileReader failed to encode blob'));
        reader.readAsDataURL(blob);
    });
}
