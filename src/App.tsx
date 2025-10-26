import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { MdPerson, MdVisibility, MdBarChart } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { VideoPreview } from "./components/video-preview";
import { startSendingFrames } from "./websocket/sender";

// Páginas secundárias
import { Profile } from './pages/Profile';
import { Acessibility } from "./pages/Acessibility"
import { Graphics } from './pages/Graphics';

// URL do backend
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://localhost:32769";
const WS_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/video`;

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

  const randomMessages = [
    "AOOOOOOOOOOOOOOOO POTENCIA",
    "Top demais",
    "Que isso mano",
    "Gostosa",
    "Bão?????",
  ];

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(mediaStream);

    const ws = new WebSocket(WS_ENDPOINT);
    wsRef.current = ws;

    ws.onopen = () => {
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
        if (data.emotion && data.emotion != "unknown") setEmotion(data.emotion);
        const random = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const side = Math.random() > 0.5 ? "left" : "right";
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: random, side }]);
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
    <BrowserRouter>
      <div className="min-h-screen bg-gray-300 font-sans flex h-screen">
        {/* SIDEBAR */}
        <aside className="w-52 bg-gray-400 text-gray-900 p-6 flex flex-col gap-6">
          <div className="bg-gray-200 h-24 w-full flex items-center justify-center rounded font-bold text-lg tracking-wide">
            LOGO
          </div>

          <nav className="flex flex-col gap-4 text-lg">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 text-left p-2 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <FaHome/> Home
            </NavLink>

            <NavLink
              to="/perfil"
              className={({ isActive }) =>
                `flex items-center gap-3 text-left p-2 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdPerson className="text-lg" />
              Perfil
            </NavLink>

            <NavLink
              to="/acessibilidade"
              className={({ isActive }) =>
                `flex items-center gap-3 text-left p-2 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdVisibility className="text-lg" />
              Acessibilidade
            </NavLink>

            <NavLink
              to="/grafico"
              className={({ isActive }) =>
                `flex items-center gap-3 text-left p-2 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdBarChart className="text-lg" />
              Gráfico
            </NavLink>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 flex flex-col justify-center">
          <Routes>
            {/* HOME (fica no próprio App) */}
            <Route
              path="/"
              element={
                <div className="flex gap-6 items-stretch h-[80vh]">
                  {/* CHAT CARD */}
                  <div className="flex-1 bg-gray-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-4 rounded-xl border-2 border-gray-700 p-6 overflow-auto">
                      <div className="flex flex-col gap-6 pb-10">
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.side === "left" ? "justify-start" : "justify-end"}`}>
                            <div
                              className={`max-w-xs px-4 py-2 rounded-full text-sm bg-white ${
                                m.side === "left" ? "rounded-tr-xl" : "rounded-tl-xl"
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
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
              }
            />

            {/* Outras páginas */}
            <Route path="/perfil" element={<Profile />} />
            <Route path="/acessibilidade" element={<Acessibility />} />
            <Route path="/grafico" element={<Graphics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
