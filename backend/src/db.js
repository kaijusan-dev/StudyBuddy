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
          nickname TEXT UNIQUE,
          email TEXT UNIQUE,
          password TEXT,
          group_id INTEGER
      );
  `;
  return await pool.query(createTableQuery);
}

export { pool, initializeScheduleTable, initializeUsersTable };