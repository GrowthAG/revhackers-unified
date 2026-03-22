// background.js - O Cérebro da Extensão (Service Worker Manifest V3)

let recordingState = 'idle'; // 'idle', 'recording'

// Configura o documento invisível (offscreen) que vai rodar o MediaRecorder
async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return; // Já existe
  }

  // Cria o documento invisível para fazer o trabalho pesado do áudio/vídeo
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: 'Gravação da aba ativa do Google Meet'
  });
}

// Escuta cliques no Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_STATE') {
    sendResponse({ state: recordingState });
    return true;
  }

  if (message.action === 'START_RECORDING') {
    startRecording(message.tab).then(() => {
        sendResponse({ success: true });
    }).catch(err => {
        console.error("Erro ao iniciar:", err);
        sendResponse({ success: false, error: err.message });
    });
    return true; // Retorno assíncrono
  }

  if (message.action === 'STOP_RECORDING') {
    stopRecording().then(() => sendResponse({ success: true }));
    return true;
  }
  
  if (message.action === 'RECORDING_ENDED') {
    recordingState = 'idle';
    // Notifica o popup se ele estiver aberto
    chrome.runtime.sendMessage({ action: 'STATE_CHANGED', state: recordingState }).catch(()=> {});
  }
});

async function startRecording(tab) {
  if (recordingState === 'recording') return;

  // 1. Obtém a ID do Stream da aba ativa do Meet
  const streamId = await new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (id) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(id);
    });
  });

  // 2. Acorda o documento invisível (onde fica o MediaRecorder)
  await setupOffscreenDocument('offscreen.html');

  // 3. Manda o ID mágico do Media Stream para o offscreen document capturar
  chrome.runtime.sendMessage({
    action: 'START_OFFSCREEN_RECORDING',
    streamId: streamId
  });

  recordingState = 'recording';
  chrome.runtime.sendMessage({ action: 'STATE_CHANGED', state: recordingState }).catch(()=> {});
  
  // Opcional: Inserir uma bolinha vermelha piscando na aba para lembrar que estamos gravando
  chrome.action.setBadgeText({ text: 'REC' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
}

async function stopRecording() {
  if (recordingState !== 'recording') return;
  
  // Pede para o documento invisível finalizar o arquivo de vídeo
  chrome.runtime.sendMessage({ action: 'STOP_OFFSCREEN_RECORDING' });
  
  recordingState = 'idle';
  chrome.action.setBadgeText({ text: '' });
  chrome.runtime.sendMessage({ action: 'STATE_CHANGED', state: recordingState }).catch(()=> {});
}
