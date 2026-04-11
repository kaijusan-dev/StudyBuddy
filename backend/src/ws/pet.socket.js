import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import * as petService from "../services/pet.service.js";

export const createPetSocket = (server) => {

  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    try {
      const query = req.url.split("?")[1];
      const params = new URLSearchParams(query);
      const token = params.get("token");

      if (!token) {
        ws.send(JSON.stringify({ type: "invalid_token" }));
        ws.close();
        return;
      }

      const decoded = (() => {
        try {
          return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {

          console.error("JWT error:", err.message);

          if (err.name === 'TokenExpiredError') {
            ws.send(JSON.stringify({ type: 'token_expired' }));
          } else {
            ws.send(JSON.stringify({ type: 'invalid_token' }));
          }
          
          setTimeout(() => ws.close(), 50);

          return null;
        }
      })();

      if (!decoded) return;

      const userId = decoded.id;
      console.log("Pet socket connected:", userId);

      const pet = await petService.getPet(userId);
      ws.send(JSON.stringify({ type: "pet_state", pet }));

      ws.on("message", async (message) => {
        const data = JSON.parse(message);

        if (data.action === "pet_state") {
          const pet = await petService.getPet(userId);
          ws.send(JSON.stringify({
            type: "pet_state",
            pet: pet,
            animation: "idle"
          }));
        }

        if (data.action === "feed") {
          const updatedPet = await petService.feedPet(userId);
          ws.send(JSON.stringify({
            type: "pet_update",
            pet: updatedPet,
            animation: "eat"
          }));
        }
      });

      const interval = setInterval(async () => {
        const pet = await petService.getPet(userId);

        ws.send(JSON.stringify({
          type: "pet_state",
          pet,
          animation: "idle"
        }));
      }, 1000);

      ws.on("close", () => {
        clearInterval(interval);
        console.log("Pet socket disconnected:", userId)
      });

    } catch (err) {
      console.error("socket error", err);
      ws.close();
    }
  });


};