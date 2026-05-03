import jwt from "jsonwebtoken";
import * as petService from "#pet";
import { WebSocketServer, WebSocket } from "ws";
import { evaluateAchievements } from "#achievements";

const activePets = new Map();
const clients = new Map();

const handlePetUpdate = async (userId, pet, ws, animation = null) => {
  const updated = petService.calculatePetState(pet);

  activePets.set(userId, updated);

  const newAchievements = await evaluateAchievements(userId, updated);

  if (newAchievements?.length > 0 && ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "achievements_unlocked",
      achievements: newAchievements,
    }));
  }

  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "pet_update",
      pet: updated,
      animation,
    }));
  }

  return updated;
};

setInterval(async () => {
  await Promise.all(
    [...activePets.entries()].map(([userId, pet]) =>
      petService.savePet(userId, pet)
    )
  );
}, 30000);

setInterval(async () => {
  for (const [userId, pet] of activePets.entries()) {
    const ws = clients.get(userId);
    const next = petService.calculatePetState(pet);

    await handlePetUpdate(userId, next, ws);
  } 
}, 5000);

export const createPetSocket = (server) => {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    try {
      const token = new URLSearchParams(req.url.split("?")[1]).get("token");

      if (!token) {
        ws.send(JSON.stringify({ type: "invalid_token" }));
        ws.close();
        return;
      }

      let decoded;

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        ws.send(JSON.stringify({
          type: err.name === "TokenExpiredError"
            ? "token_expired"
            : "invalid_token",
        }));

        setTimeout(() => ws.close(), 50);
        return;
      }

      const userId = decoded.id;

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

        const currentPet = activePets.get(userId);
        if (!currentPet) return;

        //админские действия
        if (
          data.action === "update" &&
          (decoded.role === "admin" || process.env.MODE === "development")
        ) {
          const updated = {
            ...currentPet,
            [data.field]: data.value,
            last_updated: new Date(),
          };

          await handlePetUpdate(userId, updated, ws, "idle");
          return;
        }

        //действия с питомцем
        if (data.action) {
          const acted = petService.applyAction(currentPet, data.action);
          await handlePetUpdate(userId, acted, ws);
        }
      });

      ws.on("close", async () => {
        const pet = activePets.get(userId);

        if (pet) {
          await petService.savePet(userId, pet);
        }

        clients.delete(userId);
        activePets.delete(userId);
      });
    } catch (err) {
      console.error("socket error", err);
      ws.close();
    }
  });
};