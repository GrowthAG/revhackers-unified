document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusText = document.getElementById('statusText');

  // Atualiza a UI baseado no estado
  const updateUI = (state) => {
    if (state === 'recording') {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      statusText.innerHTML = '<span style="color:#03FC3B">Gravando Deal...</span>';
    } else {
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      statusText.innerText = 'Pronto para Mapear';
    }
  };

  // Verifica o estado inicial
  chrome.runtime.sendMessage({ action: 'GET_STATE' }, (response) => {
    if (response) updateUI(response.state);
  });

  // Escuta mudanças de estado do background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'STATE_CHANGED') {
      updateUI(message.state);
    }
  });

  // Botão Start
  startBtn.addEventListener('click', async () => {
    // Pega a aba ativa onde o usuário chamou o popup
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('meet.google.com')) {
      alert("Acesse o Google Meet para iniciar a captura.");
      return;
    }

    startBtn.innerText = 'Processando...';
    startBtn.disabled = true;

    chrome.runtime.sendMessage({ action: 'START_RECORDING', tab: tab }, (res) => {
      if (!res.success) {
        alert("Falha: " + res.error);
        startBtn.innerText = '▶ INICIAR CAPTURA';
        startBtn.disabled = false;
      }
    });
  });

  // Botão Stop
  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'STOP_RECORDING' });
  });
});
