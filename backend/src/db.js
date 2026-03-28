import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function connectWithRetry(retries = 10, delay = 3000) {
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
          uid TEXT,
          start_time TIMESTAMPTZ,
          end_time TIMESTAMPTZ,
          summary TEXT,
          user_id INTEGER,
          completed BOOLEAN DEFAULT FALSE,
          UNIQUE (uid, user_id)
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
          group_id INTEGER,
          avatar TEXT,
          password TEXT,
          calendar_url TEXT,
          role user_role DEFAULT 'user'
      );
  `;
  return await pool.query(createTableQuery);
}

async function initializeUserRoleEnum() {
  const query = `
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'user');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;
  
  return await pool.query(query);
}

async function initializePetsTable() {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pets (
          user_id INTEGER PRIMARY KEY,
          fullness REAL DEFAULT 100,
          happiness INTEGER DEFAULT 100,
          energy INTEGER DEFAULT 100,
          last_updated TIMESTAMPTZ
      );
  `;
  return await pool.query(createTableQuery);
}

export { pool, initializeScheduleTable, initializeUsersTable, initializeUserRoleEnum, initializePetsTable, connectWithRetry };