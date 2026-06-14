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

  const [animation, setAnimation] = useState(null);
  const animationTimeoutRef = useRef(null);

  const [error, setError] = useState(null);

  const triggerAnimation = (name) => {

    // очищаем предыдущий таймер
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    
    setAnimation(name);
    
    // длительность анимации в мс
    const durations = { feed: 3000, caress: 3000, play: 5000 };
    const duration = durations[name] || 2500;
    
    animationTimeoutRef.current = setTimeout(() => {
      setAnimation(null);
    }, duration);
  };

  const showPetError = (message) => {
    setError(message);

    setTimeout(() => {
      setError(null);
    }, 2500);
  };

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

          if (data.type === "error") {
            showPetError(data.message);
            return;
          }

          if (data.type === "pet_state" || data.type === "pet_update") {
            setPet(data.pet);
          }

          if (data.animation) {
            triggerAnimation(data.animation);
          }

          //здесь должна быть логика показа достижения как уведомления
          // if (data.type === "achievements_unlocked") {
          //   showModal(data.achievements);
          // }

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

        const delay = Math.min(1000 * reconnectAttemptsRef.current, 15000);

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

  const sendAction = (action, animation) => {
    socketRef.current.send(JSON.stringify({ action, animation }));
  };

  const updateStat = (field, value) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ action: "update", field, value })
      );
    } else {
      console.warn("WS not ready");
    }
  };

  return {
    socketRef,
    animation,  
    pet,
    error,
    setPet,
    updateStat, 
    feedPet: () => sendAction("FEED", "feed"),
    caressPet: () => sendAction("CARESS", "caress"),
    playPet: () => sendAction("PLAY", "play"),
  };
}