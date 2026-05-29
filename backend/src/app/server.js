import app from "./app.js";
import express from 'express';
import http from 'http';
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "#infra";

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

import { createTestUser, createTestUsers } from "#admin";

const server = http.createServer(app);
createPetSocket(server);

async function getUsersCount() {
  const res = await pool.query(`SELECT COUNT(*) FROM users`);
  return Number(res.rows[0].count);
}

async function seedTestUsersInLimit(limit = 150) {

  const usersCount = await getUsersCount();

  console.log("Users in DB:", usersCount);

  if (usersCount >= limit) {
    console.log("Test users already exist, skipping seeding");
    return;
  };

  await createTestUser();
  await createTestUsers(limit - usersCount);
}

async function startServer() {
    try {
        
        await connectWithRetry();

        await initializeUserRoleEnum();
        await initializeUsersTable();

        if (process.env.MODE === 'development') seedTestUsersInLimit(150);

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