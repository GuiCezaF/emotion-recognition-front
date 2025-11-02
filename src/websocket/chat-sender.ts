import { useState, useEffect, useRef, useCallback } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  side: "left" | "right";
}

export const useChatWebSocket = (url: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected!");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: data.message,
            side: "left",
          },
        ]);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  // Função para enviar mensagem do usuário
  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = { text };
    wsRef.current.send(JSON.stringify(payload));

    // Adiciona a mensagem do usuário ao estado
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        side: "right",
      },
    ]);
  }, []);

  return { messages, sendMessage };
};
