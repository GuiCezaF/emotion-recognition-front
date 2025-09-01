import { useState, useRef } from "react";
import { Peer } from "./webrtc/peer";
import { VideoPreview } from "./components/video-preview";
import { startSendingFrames } from "./webrtc/capture-frame";

// TODO Melhorar UI/UX e estilizar
// TODO Tratar erros de conexão e exibir para o usuário
// TODO melhorar uso das variaveis ambiente
// TODO refatorar para melhorar o uso dos hooks

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [running, setRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setStream(mediaStream);

      const p = new Peer();
      await p.addVideoStream(mediaStream);
      await p.sendOffer("http://localhost:8080/emotions/video"); //TODO: colocar o  backend correto aqui

      setPeer(p);
      setRunning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startSendingFrames(videoRef.current!, p.data_chann, 100);
        };
      }

      console.log("Câmera iniciada e envio de frames ativo");
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
    }
  };

  const stopCamera = () => {
    peer?.stop();
    stream?.getTracks().forEach((t) => t.stop());
    setPeer(null);
    setStream(null);
    setRunning(false);
    console.log("Câmera parada");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>WebRTC + Frames JSON</h1>
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
