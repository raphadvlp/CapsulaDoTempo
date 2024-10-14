let recorder;
let recordedChunks = [];
let recordingTimeout;

document
  .getElementById("startRecording")
  .addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    document.getElementById("videoElement").srcObject = stream;

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const video = document.getElementById("recordedVideo");
      video.src = url;
      video.style.display = "block";

      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = url;
      downloadLink.download = "video.mp4";
      downloadLink.style.display = "block";

      // Após a gravação, habilita o botão de upload
      document.getElementById("uploadDrive").disabled = false;

      // Envia o vídeo para o servidor
      uploadVideo(blob);
    };

    recorder.start();
    document.getElementById("startRecording").disabled = true;
    document.getElementById("stopRecording").disabled = false;

    // Limita a gravação a 60 segundos
    recordingTimeout = setTimeout(() => {
      stopRecording();
    }, 60000); // 60000 ms = 60 segundos
  });

document.getElementById("stopRecording").addEventListener("click", () => {
  stopRecording();
});

function stopRecording() {
  recorder.stop();
  document.getElementById("startRecording").disabled = false;
  document.getElementById("stopRecording").disabled = true;

  // Limpa o timeout
  if (recordingTimeout) {
    clearTimeout(recordingTimeout);
  }
}

function uploadVideo(blob) {
  const formData = new FormData();
  formData.append("video", blob, "video.mp4");

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro no upload");
      }
      return response.text();
    })
    .then((result) => {
      console.log(result);
      alert("Upload realizado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro no upload:", error);
      alert("Erro no upload.");
    });
}
