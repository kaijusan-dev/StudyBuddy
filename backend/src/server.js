import app from "./app.js";
import express from 'express';
import http from 'http';
import { createPetSocket } from "./ws/pet.socket.js";
import {
  connectWithRetry,
  initializePetsTable,
  initializeScheduleTable,
  initializeUsersTable
} from "./db.js";
import { fileURLToPath } from 'url';
import path from "path";

const server = http.createServer(app);
createPetSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, '../uploads');

// отдача файлов
app.use('/api/uploads', express.static(uploadPath));

async function startServer() {
    try {
        await connectWithRetry();
        await initializeScheduleTable();
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