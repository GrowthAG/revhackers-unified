// offscreen.js - O Capturador de Tela e Áudio Real

let mediaRecorder;
let recordedChunks = [];
let currentStream;

// Escuta a ordem do background para começar ou parar
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'START_OFFSCREEN_RECORDING') {
    startRecording(message.streamId);
  }
  
  if (message.action === 'STOP_OFFSCREEN_RECORDING') {
    stopRecording();
  }
});

async function startRecording(streamId) {
  try {
    // 1. Obtém a mídia da Aba ativa usando a ID mágica que o Background nos deu
    // Precisamos rodar isso dentro desse documento offscreen, porque Service Workers não têm acesso ao navigator.mediaDevices
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });

    // Como o cliente vai ouvir a call dele pelo Meet enquanto gravamos?
    // Precisamos ligar a trilha de áudio no Contexto e tocar para o próprio destino (feedback loop), 
    // senão o Chrome muta a aba que está sendo capturada.
    const audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNode.connect(audioContext.destination);

    currentStream = stream;

    // 2. Prepara o gravador de vídeo (WebM)
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9,opus'
    });

    recordedChunks = [];

    // Opcional Futuro: "Chunking". Salvar pedaços a cada 2 minutos (ex: start(120000))
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      // Quando a gravação para, junta os pedaços num Blob
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      console.log('Gravação Finalizada. Tamanho do vídeo:', blob.size, 'bytes');

      // Neste MVP: vamos fazer o download direto para o Computador do Usuário para testar a qualidade
      // Na Fase 3 enviaremos esse Blob direto para o Supabase Storage via Fetch!
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `RevHackers-Meet-${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Avisa o painel superior que pode voltar ao normal
      chrome.runtime.sendMessage({ action: 'RECORDING_ENDED' });

      // Desliga a luz vermelha da câmera e os microfones
      stream.getTracks().forEach(track => track.stop());
    };

    // Inicia a gravação (sem chunking explícito neste primeiro MVP local)
    mediaRecorder.start();
    
  } catch (error) {
    console.error('Erro fatal ao iniciar a captura da Aba:', error);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
