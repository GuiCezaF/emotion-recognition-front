import { useState, useRef } from "react";
import { VideoPreview } from "./components/video-preview";
import { MdPerson, MdVisibility, MdBarChart } from "react-icons/md";
import { startSendingFrames } from "./websocket/sender";

// URL do backend
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://localhost:32771";
const WS_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/video`;

// Tipo das mensagens do chat
type ChatMsg = {
  id: string;
  text: string;
  side: "left" | "right";
};

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const senderRef = useRef<{ stop: () => void } | null>(null);

  // Mensagens aleatórias pro chat
  const randomMessages = [
    "AOOOOOOOOOOOOOOOO POTENCIA",
    "Top demais",
    "Que isso mano",
    "Gostosa",
    "Bão?????",
  ];

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

        // Atualiza emoção
        if (data.emotion) setEmotion(data.emotion);

        // Adiciona mensagem aleatória no chat
        const random = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const side = Math.random() > 0.5 ? "left" : "right";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: random, side },
        ]);
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
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-300 font-sans">
      <div className="flex h-screen">
        {/* SIDEBAR */}
       <aside className="w-52 bg-gray-400 text-gray-900 p-6 flex flex-col gap-6">
  <div className="bg-gray-200 h-24 w-full flex items-center justify-center rounded">
    LOGO
  </div>

  <nav className="flex flex-col gap-4 text-sm">
    <button className="flex items-center gap-3 text-left hover:bg-gray-300 p-2 rounded">
      <MdPerson className="text-lg" />
      Perfil
    </button>

    <button className="flex items-center gap-3 text-left hover:bg-gray-300 p-2 rounded">
      <MdVisibility className="text-lg" />
      Acessibilidade
    </button>

    <button className="flex items-center gap-3 text-left hover:bg-gray-300 p-2 rounded">
      <MdBarChart className="text-lg" />
      Gráfico
    </button>
  </nav>
</aside>

        {/* MAIN AREA */}
        <main className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex gap-6 items-stretch h-[80vh]">
            {/* CHAT CARD */}
            <div className="flex-1 bg-gray-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-4 rounded-xl border-2 border-gray-700 p-6 overflow-auto">
                {/* Chat bubbles */}
                <div className="flex flex-col gap-6 pb-10">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.side === "left" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-full text-sm bg-white ${
                          m.side === "left"
                            ? "rounded-tr-xl"
                            : "rounded-tl-xl"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Barra inferior (simulada) */}
                <div className="absolute left-1/4 right-1/4 bottom-6">
                  <div className="h-4 rounded-full bg-gray-500 opacity-80" />
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <aside className="w-[50vh] flex-shrink-0 flex flex-col gap-4">
              <div className="bg-gray-200 rounded p-4 flex items-center justify-center h-60">
                <VideoPreview stream={stream} />
                <video ref={videoRef} style={{ display: "none" }} />
              </div>

              <div className="bg-gray-200 rounded p-4">
                <div className="text-sm text-gray-600">Emoção atual:</div>
                <div className="mt-2 bg-white rounded p-3 text-center shadow">
                  {emotion ?? "—"}
                </div>
              </div>

              <div className="bg-gray-200 rounded p-3 text-xs text-gray-600">
                Frame: {running ? "enviando" : "parado"}
              </div>

              <div className="mt-auto">
                {!running ? (
                  <button
                    onClick={startCamera}
                    className="w-full py-2 rounded bg-gray-700 text-white"
                  >
                    Iniciar câmera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full py-2 rounded bg-red-600 text-white"
                  >
                    Parar câmera
                  </button>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
