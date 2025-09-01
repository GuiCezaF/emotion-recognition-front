export function startSendingFrames(
  video: HTMLVideoElement,
  dc: RTCDataChannel,
  intervalMs = 100
) {

  // TODO: adicionar tratamento de erros
  // TODO: melhorar performance se necessario
  
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d")!;

  const sendFrame = () => {
    if (video.paused || video.ended) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% qualidade
    const json = JSON.stringify({ frame: dataUrl });

    if (dc.readyState === "open") {
      dc.send(json);
    }

    setTimeout(sendFrame, intervalMs);
  };

  sendFrame();
}
