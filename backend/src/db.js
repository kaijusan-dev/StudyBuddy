import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected');
      return;
    } catch (err) {
      console.log(`DB not ready yet (${i + 1}/${retries}), retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to connect to DB after retries');
}

async function initializeScheduleTable() {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS schedule (
          id SERIAL PRIMARY KEY,
          uid TEXT UNIQUE,
          start_time TIMESTAMPTZ,
          end_time TIMESTAMPTZ,
          summary TEXT,
          group_id INTEGER
      );
  `;
  return await pool.query(createTableQuery);
}

async function initializeUsersTable() {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE,
          email TEXT UNIQUE,
          password TEXT,
          group_id INTEGER
      );
  `;
  return await pool.query(createTableQuery);
}

export { pool, initializeScheduleTable, initializeUsersTable, connectWithRetry };