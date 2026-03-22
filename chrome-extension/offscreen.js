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

let mediaRecorder = null;
let audioChunks   = [];

// ============================================================
// LISTENER DE MENSAGENS DO BACKGROUND
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target !== 'offscreen') return false;

    if (request.action === 'startCapture') {
        startCapture(request.streamId)
            .then(() => sendResponse({ success: true }))
            .catch(err => {
                console.error(`${LOG_PREFIX} offscreen startCapture error:`, err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (request.action === 'stopCapture') {
        stopCapture()
            .then(audioBlob => sendResponse({ success: true, audioBlob }))
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

async function startCapture(streamId) {
    audioChunks = [];

    // Obtem o MediaStream do tab a partir do streamId fornecido pelo background
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId,
            },
        },
        video: false,
    });

    // Escolhe o melhor codec disponivel
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

    mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
    });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.onerror = (event) => {
        console.error(`${LOG_PREFIX} MediaRecorder error:`, event.error?.message || 'unknown');
    };

    // Inicia gravacao com chunks de 1 segundo para permitir progresso incremental
    mediaRecorder.start(1000);

    // Roteia o audio de volta para os alto-falantes para que o usuario continue ouvindo
    try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(audioContext.destination);
    } catch (e) {
        console.warn(`${LOG_PREFIX} could not route audio to speakers:`, e.message);
    }

    console.log(`${LOG_PREFIX} offscreen capture started, mimeType: ${mimeType}`);
}

// ============================================================
// PARADA DA CAPTURA
// Retorna um Blob com o audio completo.
// ============================================================

async function stopCapture() {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('Nenhuma gravacao ativa no offscreen document'));
            return;
        }

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log(`${LOG_PREFIX} offscreen capture stopped, blob size: ${audioBlob.size} bytes, chunks: ${audioChunks.length}`);

            // Para todas as tracks para liberar o microfone/tab audio
            try {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            } catch (e) { /* ignorar */ }

            mediaRecorder = null;
            audioChunks   = [];

            resolve(audioBlob);
        };

        mediaRecorder.onerror = (event) => {
            reject(new Error(`MediaRecorder stop error: ${event.error?.message || 'unknown'}`));
        };

        mediaRecorder.stop();
    });
}
