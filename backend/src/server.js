import app from "./app.js";
import express from 'express';
import http from 'http';
import { createPetSocket } from "./ws/pet.socket.js";
import {
  connectWithRetry,
  initializePetsTable,
  initializeScheduleTable,
  initializeUserRoleEnum,
  initializeUsersTable
} from "./db.js";
import path from "path";

const server = http.createServer(app);
createPetSocket(server);

async function startServer() {
    try {
        await connectWithRetry();
        await initializeScheduleTable();
        await initializeUserRoleEnum();
        await initializeUsersTable();
        await initializePetsTable();

        console.log('Tables initialized');

    } catch (err) {
        console.error('Error starting server:', err);
    }
}
await startServer();

// production
if (process.env.MODE === 'production') {

  const distPath = path.join(__dirname, "../frontend");

  // отдаём статику фронта
  app.use(express.static(distPath));

  // fallback для SPA (только GET запросы доступны, кроме /api)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0',() => {
    console.log(`Started server on port ${PORT}`);
});