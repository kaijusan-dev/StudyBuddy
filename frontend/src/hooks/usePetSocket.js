import { useEffect, useRef, useState } from "react";

export function usePetSocket(token) {
  const [pet, setPet] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:3000?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("Pet socket connected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "pet_state" || data.type === "pet_update") {
        setPet(data.pet);
      }
    };

    ws.onclose = () => console.log("Pet socket closed");

    return () => {
      ws.close();
    };
  }, [token]);

  const feedPet = () => {
    if (socketRef.current && pet) {
      socketRef.current.send(JSON.stringify({ action: "feed" }));
    }
  };

  return { pet, feedPet };
}