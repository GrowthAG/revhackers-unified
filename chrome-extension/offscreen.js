// Offscreen Document - Handles actual audio recording
// This runs in a separate context with access to MediaRecorder

let mediaRecorder = null;
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.target !== 'offscreen') return;

    if (request.action === 'startCapture') {
        startCapture(request.streamId)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (request.action === 'stopCapture') {
        stopCapture()
            .then(audioBlob => sendResponse({ success: true, audioBlob }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function startCapture(streamId) {
    audioChunks = [];

    // Get the stream from the stream ID
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId
            }
        },
        video: false
    });

    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
    });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
    };

    // Start recording with 1 second chunks
    mediaRecorder.start(1000);
    console.log('Recording started');

    // FIX: Route audio to speakers so user can hear it
    try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(audioContext.destination);
    } catch (e) {
        console.error("Error routing audio to speakers:", e);
    }
}

async function stopCapture() {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('No active recording'));
            return;
        }

        mediaRecorder.onstop = () => {
            // Combine all chunks into a single blob
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log('Recording stopped, blob size:', audioBlob.size);

            // Stop all tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());

            mediaRecorder = null;
            audioChunks = [];

            resolve(audioBlob);
        };

        mediaRecorder.stop();
    });
}
