// Popup Script - Controls the recording UI

const SUPABASE_URL = 'https://your-project.supabase.co'; // TODO: Replace with actual URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // TODO: Replace with actual key

let isRecording = false;
let recordingStartTime = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('status');
    const timerEl = document.getElementById('timer');
    const recordBtn = document.getElementById('recordBtn');
    const autoRecordCheckbox = document.getElementById('autoRecord');

    // Load settings
    const settings = await chrome.storage.local.get(['autoRecord']);
    autoRecordCheckbox.checked = settings.autoRecord || false;

    // Save settings on change
    autoRecordCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ autoRecord: autoRecordCheckbox.checked });
    });

    // Check if we're on a Meet page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isMeetPage = tab?.url?.includes('meet.google.com');

    if (!isMeetPage) {
        statusEl.textContent = 'Abra uma reunião do Google Meet';
        recordBtn.disabled = true;
        return;
    }

    // Check recording state
    const state = await chrome.storage.local.get(['isRecording', 'recordingStartTime']);
    isRecording = state.isRecording || false;
    recordingStartTime = state.recordingStartTime;

    updateUI();

    // Button click handler
    recordBtn.addEventListener('click', async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    });

    function updateUI() {
        if (isRecording) {
            statusEl.textContent = '● Gravando...';
            statusEl.classList.add('recording');
            recordBtn.textContent = 'Parar Gravação';
            recordBtn.classList.add('stop');
            recordBtn.disabled = false;
            timerEl.style.display = 'block';
            startTimer();
        } else {
            statusEl.textContent = 'Pronto para gravar';
            statusEl.classList.remove('recording');
            recordBtn.textContent = 'Iniciar Gravação';
            recordBtn.classList.remove('stop');
            recordBtn.disabled = false;
            timerEl.style.display = 'none';
            stopTimer();
        }
    }

    async function startRecording() {
        try {
            // Send message to background script to start recording
            const response = await chrome.runtime.sendMessage({ action: 'startRecording', tabId: tab.id });

            if (response.success) {
                isRecording = true;
                recordingStartTime = Date.now();
                await chrome.storage.local.set({ isRecording: true, recordingStartTime });

                // Notify content script
                await chrome.tabs.sendMessage(tab.id, { action: 'recordingStarted' });

                updateUI();
            } else {
                alert('Erro ao iniciar gravação: ' + response.error);
            }
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Erro ao iniciar gravação. Verifique as permissões.');
        }
    }

    async function stopRecording() {
        try {
            // Send message to background script to stop recording
            const response = await chrome.runtime.sendMessage({ action: 'stopRecording' });

            isRecording = false;
            await chrome.storage.local.set({ isRecording: false, recordingStartTime: null });

            // Notify content script
            await chrome.tabs.sendMessage(tab.id, { action: 'recordingStopped' });

            updateUI();

            if (response.success) {
                statusEl.textContent = 'Processando transcrição...';
                // The background script will handle uploading
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }

    function startTimer() {
        if (timerInterval) return;

        timerInterval = setInterval(() => {
            if (!recordingStartTime) return;

            const elapsed = Date.now() - recordingStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);

            timerEl.textContent =
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
});
