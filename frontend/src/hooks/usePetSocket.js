import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function usePetSocket(token) {
  const { loading } = useAuth();
  const [pet, setPet] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const isUnmountedRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (loading || !token) return;

    const host = window.location.host;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    isUnmountedRef.current = false;
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;

    const connect = () => {
      if (isUnmountedRef.current) return;
      if (!shouldReconnectRef.current) return;
      if (!token) return;

      // чтобы не создавать второй сокет
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const ws = new WebSocket(`${protocol}://${host}/ws?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WS connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "token_expired") {
            console.warn("Token expired");
            shouldReconnectRef.current = false;
            ws.close();

            window.dispatchEvent(new Event("unauthorized"));
            return;
          }

          if (data.type === "pet_state" || data.type === "pet_update") setPet(data.pet);
          
        } catch (err) {
          console.error("WS parse error", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WS error", err);
      };

      ws.onclose = (e) => {
        if (isUnmountedRef.current) return;
        if (!shouldReconnectRef.current) return;

        if (e.code === 1006) {
          console.warn("WS failed with code 1006, stop reconnect");
          return;
        }

        reconnectAttemptsRef.current += 1;

        const delay = Math.min(2000 * reconnectAttemptsRef.current, 15000);

        console.log(`WS Reconnect in ${delay}ms`);

        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isUnmountedRef.current = true;
      shouldReconnectRef.current = false;

      clearTimeout(reconnectTimeoutRef.current);

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token, loading]);

  const sendAction = (action) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action }));
    } else {
      console.warn("WS not ready");
    }
  };

  return {
    pet,
    setPet,
    feedPet: () => sendAction("feed"),
  };
}