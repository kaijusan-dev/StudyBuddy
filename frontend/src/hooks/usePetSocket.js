import { useEffect, useRef, useState } from "react";

export function usePetSocket(token) {
  const [pet, setPet] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const host = window.location.hostname;

    let ws;

    const connect = () => {
      ws = new WebSocket(`ws://${host}:3000?token=${token}`);

      socketRef.current = ws;

      ws.onopen = () => {
        console.log("Pet socket connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "pet_state" || data.type === "pet_update") {
          setPet({...data.pet, last_updated: new Date()});
        }
        
      };

      ws.onclose = () => {
        console.log("Socket closed, reconnecting...");
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        ws.close();
      };
    };

    connect();

    return () => {
      ws?.close();
    };
  }, [token]);

  const sendAction = (action) => {
    socketRef.current?.send(JSON.stringify({ action }));
  };

  return {
    pet,
    feedPet: () => sendAction("feed"),
  };
}