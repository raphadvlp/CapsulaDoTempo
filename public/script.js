let mediaRecorder;
let recordedChunks = [];
let recordingTime = 0;
let recordingInterval;

const video = document.getElementById("video");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const uploadButton = document.getElementById("uploadDrive");
const timerDisplay = document.getElementById("timer");

startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  video.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    video.srcObject = null;
    video.src = url;
    video.controls = true;
    uploadButton.disabled = false; // Ativa o botão de upload

    // Reinicia os chunks gravados
    recordedChunks = [];
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;

  // Inicia o contador de tempo
  recordingTime = 0;
  timerDisplay.textContent = "Tempo de Gravação: 0s";
  recordingInterval = setInterval(() => {
    recordingTime++;
    timerDisplay.textContent = `Tempo de Gravação: ${recordingTime}s`;

    // Para a gravação após 60 segundos
    if (recordingTime >= 60) {
      stopRecording();
    }
  }, 1000);
});

stopButton.addEventListener("click", stopRecording);

function stopRecording() {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;

  // Para o contador de tempo
  clearInterval(recordingInterval);
}

uploadButton.addEventListener("click", async () => {
  const blob = new Blob(recordedChunks, { type: "video/webm" });

  const formData = new FormData();
  formData.append("video", blob, "gravacao.webm"); // Certifique-se que o nome do arquivo está correto.

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Upload realizado com sucesso!");
    } else {
      alert("Erro no upload");
    }
  } catch (error) {
    console.error("Erro ao enviar para o Google Drive: ", error);
    alert("Erro no upload");
  }
});
