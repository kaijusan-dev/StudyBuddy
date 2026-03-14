import { pool } from "../db.js";

const findUserById = async (id) => {
    const res = await pool.query(`
        SELECT * FROM users WHERE id = $1`, 
        [id]
    )
    return res.rows[0] || null;
};

const findUserByUsername = async (username) => {
    const res = await pool.query(`
        SELECT * FROM users WHERE username = $1`, 
        [username]
    )
    return res.rows[0] || null;
};

const findUserByEmail = async (email) => {
    const res = await pool.query(`
        SELECT * FROM users WHERE email = $1`, 
        [email]
    )
    return res.rows[0] || null;
};

const createUser = async ({ username, email, group_id, password }) => {
  const res = await pool.query(
    `INSERT INTO users (username, email, group_id, avatar, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [username, email, group_id, avatar, password]
  )
  return res.rows[0]
};

export {findUserById, findUserByUsername, findUserByEmail, createUser};