import jwt from "jsonwebtoken";
import * as petService from "#pet";
import { WebSocketServer, WebSocket } from "ws";

const activePets = new Map(); 
const clients = new Map();

const applyPetUpdate = (userId, updater) => {
  const pet = activePets.get(userId);
  if (!pet) return;

  const updated = updater(pet);

  if (!updated) return;

  activePets.set(userId, updated);

  return updated;
};

setInterval(() => {
  for (const [userId, pet] of activePets.entries()) {
    const updated = applyPetUpdate(userId, (p) => {
      const next = petService.calculatePetState(p);
      return {
        ...next,
      };
    }); 

    if (!updated) continue;

    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "pet_state",
        pet: updated,
      }));
    }
  }
}, 5000);

setInterval(async () => {
  await Promise.all(
    [...activePets.entries()].map(([userId, pet]) =>
      petService.savePet(userId, pet)
    )
  );
}, 30000);

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

      clients.set(userId, ws);
      activePets.set(userId, pet);

      //initial state
      ws.send(JSON.stringify({
        type: "pet_state",
        pet,
      }));

      ws.on("message", async (message) => {

        const data = JSON.parse(message);

        if (data.action === "update" && (decoded.role === 'admin' || process.env.MODE === 'development')) {
          
          const updated = applyPetUpdate(userId, (pet) => {
            
            const current = petService.calculatePetState(pet);

            if (!(data.field in current)) return current;

            return {
              ...current,
              [data.field]: data.value,
              last_updated: new Date(),
            };
          });

          if (!updated) return;

          console.log(data.field, data.value);

          ws.send(JSON.stringify({
            type: "pet_update",
            pet: updated,
            animation: "idle",
          }));

          return;
        }

        //действия с питомцем
        if (data.action) {
          const updated = applyPetUpdate(userId, (pet) =>
            petService.applyAction(pet, data.action)
          );

          ws.send(JSON.stringify({
            type: "pet_update",
            pet: updated,
          }));
        }
      });

      ws.on("close", async () => {
        const pet = activePets.get(userId);

        if (pet) {
          await petService.savePet(userId, pet);
          clients.delete(userId);
          activePets.delete(userId);
        }
      });

    } catch (err) {
      console.error("socket error", err);
      ws.close();
    }
  });


};