import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import * as petService from "../services/pet.service.js";

export const createPetSocket = (server) => {

  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {

    try {

      const url = new URL(req.url, `http://${req.headers.host}`);

      const token = url.searchParams.get("token");

      if (!token) {
        ws.close();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      const userId = decoded.id;

      console.log("Pet socket connected:", userId);

      const pet = await petService.getPet(userId);

      ws.send(JSON.stringify({
        type: "pet_state",
        pet
      }));

      ws.on("message", async (message) => {

        const data = JSON.parse(message);

        if (data.action === "feed") {

          const updatedPet = await petService.feedPet(userId);

          ws.send(JSON.stringify({
            type: "pet_update",
            pet: updatedPet,
            animation: "eat"
          }));

        }

      });

      ws.on("close", () => {
        console.log("Pet socket disconnected:", userId);
      });

    } catch (err) {

      console.error("socket error", err);
      ws.close();
    }

  });

};