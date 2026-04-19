import app from "./app.js";
import express from 'express';
import http from 'http';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createPetSocket } from "./ws/pet.socket.js";
import {
  connectWithRetry,
  initializePetsTable,
  initializeScheduleTable,
  initializeUserRoleEnum,
  initializeUsersTable
} from "#infra";

const server = http.createServer(app);
createPetSocket(server);

async function startServer() {
    try {
        
        await connectWithRetry();

        await initializeUserRoleEnum();
        await initializeUsersTable();
        await initializeScheduleTable();
        await initializePetsTable();

        console.log('Tables initialized');

    } catch (err) {
        console.error('Error starting server:', err);
    }
}
await startServer();

// production
if (process.env.MODE === 'production') {

  const distPath = path.resolve("frontend/dist");

  //отдаем статику фронта
  app.use(express.static(distPath));

  // принимаются только GET запросы, кроме api
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0',() => {
    console.log(`Started server on port ${PORT}`);
});