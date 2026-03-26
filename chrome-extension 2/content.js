// Content Script - Injected into Google Meet pages
// Shows recording indicator and handles auto-record

let isRecording = false;
let indicatorEl = null;

// Create recording indicator
function createIndicator() {
    if (indicatorEl) return;

    indicatorEl = document.createElement('div');
    indicatorEl.id = 'revhackers-recording-indicator';
    indicatorEl.innerHTML = `
        <div class="revhackers-rec-dot"></div>
        <span>REC</span>
    `;
    document.body.appendChild(indicatorEl);
}

function showIndicator() {
    if (!indicatorEl) createIndicator();
    indicatorEl.style.display = 'flex';
}

function hideIndicator() {
    if (indicatorEl) {
        indicatorEl.style.display = 'none';
    }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'recordingStarted') {
        isRecording = true;
        showIndicator();
        sendResponse({ success: true });
    }

    if (request.action === 'recordingStopped') {
        isRecording = false;
        hideIndicator();
        sendResponse({ success: true });
    }
});

// Check for auto-record setting
async function checkAutoRecord() {
    const settings = await chrome.storage.local.get(['autoRecord']);

    if (settings.autoRecord) {
        // Wait for meeting to be fully loaded
        const checkMeeting = setInterval(() => {
            // Check if we're in an active meeting (has participants)
            const participantCount = document.querySelector('[data-participant-id]');

            if (participantCount) {
                clearInterval(checkMeeting);

                // Start recording automatically
                chrome.runtime.sendMessage({ action: 'autoStartRecording' });
            }
        }, 2000);

        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkMeeting), 30000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAutoRecord();
});

// Also check on page load (for SPAs)
checkAutoRecord();

// Extract meeting info
function getMeetingInfo() {
    const title = document.querySelector('[data-meeting-title]')?.textContent ||
        document.title.replace(' - Google Meet', '') ||
        'Reunião sem título';

    const participants = [];
    document.querySelectorAll('[data-participant-id]').forEach(el => {
        const name = el.querySelector('[data-self-name]')?.textContent;
        if (name) participants.push(name);
    });

    return { title, participants };
}
