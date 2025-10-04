import { useState, useRef } from "react";
import { VideoPreview } from "./components/video-preview";
import { startSendingFrames } from "./websocket/sender";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://localhost:32771";
const WS_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/video`;

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const senderRef = useRef<{ stop: () => void } | null>(null);

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setStream(mediaStream);

    const ws = new WebSocket(WS_ENDPOINT);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] conexão aberta");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          senderRef.current = startSendingFrames(videoRef.current!, ws, 1500);
        };
      }
      setRunning(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] resposta:", data);
        
      } catch (err) {
        console.error("[WS] erro ao parsear resposta:", err);
      }
    };
  };

  const stopCamera = () => {
    senderRef.current?.stop();
    wsRef.current?.close();
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Detecção de Emoções – WebSocket</h1>

      <VideoPreview stream={stream} />
      <video ref={videoRef} style={{ display: "none" }} />

      {!running ? (
        <button
          onClick={startCamera}
          style={{ marginTop: 16, padding: "8px 16px" }}
        >
          Iniciar câmera
        </button>
      ) : (
        <button
          onClick={stopCamera}
          style={{ marginTop: 16, padding: "8px 16px" }}
        >
          Parar câmera
        </button>
      )}
    </div>
  );
}
