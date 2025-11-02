import { useState, useEffect, useRef, useCallback } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  side: "left" | "right";
}

export const useChatWebSocket = (url: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    try {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Chat WS] conectado!");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.message) {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                text: data.message,
                side: "left",
              },
            ]);
          }
        } catch (err) {
          console.error("[Chat WS] erro ao parsear:", err);
        }
      };

      ws.onclose = () => {
        console.warn("[Chat WS] desconectado");
        setConnected(false);
      };

      ws.onerror = (err) => {
        console.warn("[Chat WS] erro:", err);
        setConnected(false);
      };
    } catch (err) {
      console.warn("[Chat WS] falha ao inicializar:", err);
      setConnected(false);
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [url]);

  // Envia mensagem — e não quebra se o WS estiver desconectado
  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      side: "right",
    };

    // Mostra localmente mesmo sem WS
    setMessages((prev) => [...prev, message]);

    // Tenta enviar via WS se estiver conectado
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ message: text }));
      } catch (err) {
        console.warn("[Chat WS] falha ao enviar:", err);
      }
    } else {
      console.warn("[Chat WS] não conectado, mensagem só local");
    }
  }, []);

  return { messages, sendMessage, connected };
};
