import { generateUuid } from "../utils/uuid";

export function startSendingFrames(
  video: HTMLVideoElement,
  ws: WebSocket,           
  intervalMs = 1500
): { stop: () => void } {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d")!;

  let stopped = false;

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const sendFrame = async () => {
    if (stopped) return;

    if (video.paused || video.ended || ws.readyState !== WebSocket.OPEN) {
      setTimeout(sendFrame, intervalMs);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setTimeout(sendFrame, intervalMs);
        return;
      }

      const base64 = await blobToBase64(blob);
      const payload = {
        correlation_id: generateUuid(),
        timestamp: new Date().toISOString(),
        frame: base64,
      };

      ws.send(JSON.stringify(payload));
    }, "image/jpeg", 0.7);

    setTimeout(sendFrame, intervalMs);
  };

  sendFrame();

  return {
    stop: () => {
      stopped = true;
    }
  };
}
