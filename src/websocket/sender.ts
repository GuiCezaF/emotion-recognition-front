import { generateUuid } from "../utils/uuid";

export function startSendingFrames(
  video: HTMLVideoElement,
  wsBaseUrl: string,
  intervalMs = 1500
) {
  const wsUrl = `${wsBaseUrl}?session=${generateUuid()}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("[WS] conexão aberta");
  ws.onerror = (e) => console.error("[WS] erro:", e);
  ws.onclose = () => console.log("[WS] conexão fechada");

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d")!;

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        
        const result = reader.result as string;
        resolve(result.split(",")[1]); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendFrame = async () => {
    if (video.paused || video.ended) {
      setTimeout(sendFrame, intervalMs);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.warn("[WS] blob vazio");
          setTimeout(sendFrame, intervalMs);
          return;
        }

        const base64 = await blobToBase64(blob);
        const payload = {
          timestamp: new Date().toISOString(),
          frame: base64,
        };

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      },
      "image/jpeg",
      0.7
    );

    setTimeout(sendFrame, intervalMs);
  };

  const waitForOpen = () => {
    if (ws.readyState === WebSocket.OPEN) sendFrame();
    else setTimeout(waitForOpen, 50);
  };
  waitForOpen();

  return { stop: () => ws.close() };
}
