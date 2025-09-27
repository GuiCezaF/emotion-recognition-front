import { useState, useRef } from "react";
import { VideoPreview } from "./components/video-preview";
import { startSendingFrames } from "./websocket/sender";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "https://localhost:32773";
const WS_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/video`;

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const senderRef = useRef<{ stop: () => void } | null>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          senderRef.current = startSendingFrames(
            videoRef.current!,
            WS_ENDPOINT,
            1500 
          );
        };
      }

      setRunning(true);
    } catch (err: any) {
      console.error("[App] erro ao iniciar câmera:", err);
      setErrorMsg(err?.message ?? "Falha inesperada");
    }
  };

  const stopCamera = () => {
    senderRef.current?.stop();
    senderRef.current = null;

    stream?.getTracks().forEach((t) => t.stop());

    setStream(null);
    setRunning(false);
    setErrorMsg(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Detecção de Emoções – WebSocket</h1>

      {errorMsg && (
        <div style={{ color: "red", marginBottom: 12 }}>{errorMsg}</div>
      )}

      <VideoPreview stream={stream} />

      <video ref={videoRef} style={{ display: "none" }} />

      {!running ? (
        <button onClick={startCamera} style={{ marginTop: 16, padding: "8px 16px" }}>
          Iniciar câmera
        </button>
      ) : (
        <button onClick={stopCamera} style={{ marginTop: 16, padding: "8px 16px" }}>
          Parar câmera
        </button>
      )}
    </div>
  );
}
