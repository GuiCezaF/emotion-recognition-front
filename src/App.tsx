import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { MdPerson, MdVisibility, MdBarChart } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { VideoPreview } from "./components/video-preview";
import { startSendingFrames } from "./websocket/image-sender";
import logo from "../public/logo.png";

import { Profile } from './pages/Profile';
import { Acessibility } from "./pages/Acessibility"
import { Graphics } from './pages/Graphics';
import { useTranslation } from "react-i18next";
import { useChatWebSocket } from "./websocket/chat-sender";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const WS_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/video`;
const WS_CHAT_ENDPOINT = `${BACKEND_URL.replace(/^http/, "ws")}/emotions/chat`;

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);

  const { messages: wsMessages, sendMessage } = useChatWebSocket(WS_CHAT_ENDPOINT);
  const [input, setInput] = useState("");

  const messages = wsMessages;

  const handleSend = () => {
    if (!input.trim()) return;
    try {
      sendMessage(input);
    } catch (err) {
      console.warn("[Chat] Falha ao enviar via WS, modo offline:", err);
    }
    setInput("");
  };

  // tradução
  const { t } = useTranslation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const senderRef = useRef<{ stop: () => void } | null>(null);

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
        if (data.emotion && data.emotion !== "unknown") setEmotion(data.emotion);
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
      <div className="min-h-screen bg-gray-300 font-sans flex flex-col md:flex-row h-screen">
        {/* SIDEBAR */}
        <aside className="w-full md:w-52 bg-gray-400 text-gray-900 p-4 md:p-6 flex flex-row md:flex-col gap-4 md:gap-6 md:h-screen h-auto">
          <div className="h-16 md:h-24 w-full flex items-center justify-center rounded font-bold text-lg tracking-wide">
            <img src={logo}/>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 md:gap-4 text-base md:text-lg w-full">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 md:gap-3 text-left p-2 rounded transition-all duration-200 w-full ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <FaHome/> <span className="hidden sm:inline">Home</span>
            </NavLink>

            <NavLink
              to="/perfil"
              className={({ isActive }) =>
                `flex items-center gap-2 md:gap-3 text-left p-2 rounded transition-all duration-200 w-full ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdPerson className="text-lg" />
              <span className="hidden sm:inline">Perfil</span>
            </NavLink>

            <NavLink
              to="/acessibilidade"
              className={({ isActive }) =>
                `flex items-center gap-2 md:gap-3 text-left p-2 rounded transition-all duration-200 w-full ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdVisibility className="text-lg" />
              <span className="hidden sm:inline">Acessibilidade</span>
            </NavLink>

            <NavLink
              to="/grafico"
              className={({ isActive }) =>
                `flex items-center gap-2 md:gap-3 text-left p-2 rounded transition-all duration-200 w-full ${
                  isActive
                    ? "bg-gray-600 text-white shadow-inner"
                    : "hover:bg-gray-300"
                }`
              }
            >
              <MdBarChart className="text-lg" />
              <span className="hidden sm:inline">Gráfico</span>
            </NavLink>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-2 md:p-6 flex flex-col justify-center">
          <Routes>
            {/* HOME */}
            <Route
              path="/"
              element={
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch h-auto md:h-[80vh]">
                  {/* CHAT CARD + INPUT */}
                  <div className="flex flex-col flex-1 bg-gray-800 rounded-2xl p-2 md:p-6 shadow-inner min-h-[60vh] md:min-h-[200px]">
                    {/* MENSAGENS */}
                    <div className="flex-1 overflow-auto rounded-xl border-2 border-gray-700 p-2 md:p-6">
                      <div className="flex flex-col gap-3 md:gap-6 pb-2">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`flex ${m.side === "left" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[90vw] md:max-w-xs px-3 md:px-4 py-2 text-xs md:text-sm 
                                ${m.side === "left"
                                  ? "bg-gray-200 text-gray-900 rounded-2xl rounded-bl-none self-start"
                                  : "bg-blue-500 text-white rounded-2xl rounded-br-none self-end"
                                }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* INPUT ABAIXO */}
                    <div className="flex gap-0 md:gap-2 mt-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-3 py-2 rounded-l-full text-sm"
                      />
                      <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-full"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>

                  {/* RIGHT PANEL */}
                  <aside className="w-full md:w-[50vh] flex-shrink-0 flex flex-col gap-3 md:gap-4 mt-4 md:mt-0">
                    <div className="bg-gray-200 rounded p-2 md:p-4 flex items-center justify-center h-36 md:h-60">
                      <VideoPreview stream={stream} />
                      <video ref={videoRef} style={{ display: "none" }} />
                    </div>

                    <div className="bg-gray-200 rounded p-2 md:p-4">
                      <div className="text-xs md:text-sm text-gray-600">Emoção atual:</div>
                      <div className="mt-2 bg-white rounded p-2 md:p-3 text-center shadow min-h-[24px]">
                        {emotion ? t(emotion) : "—"}
                      </div>
                    </div>

                    <div className="bg-gray-200 rounded p-2 md:p-3 text-xs text-gray-600">
                      Frame: {running ? "enviando" : "parado"}
                    </div>

                    <div className="mt-auto">
                      {!running ? (
                        <button
                          onClick={startCamera}
                          className="w-full py-2 rounded bg-gray-700 text-white text-sm md:text-base"
                        >
                          Iniciar câmera
                        </button>
                      ) : (
                        <button
                          onClick={stopCamera}
                          className="w-full py-2 rounded bg-red-600 text-white text-sm md:text-base"
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