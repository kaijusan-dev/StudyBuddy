import { pool } from "../db.js";

const findUserByNickname = async (nickname) => {
    const res = await pool.query(`
        SELECT * FROM users WHERE nickname = $1`, 
        [nickname]
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

const createUser = async ({ nickname, email, group_id, password }) => {
  const res = await pool.query(
    `INSERT INTO users (nickname, email, group_id, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nickname, email, group_id, password]
  )
  return res.rows[0]
};

export {findUserByNickname, findUserByEmail, createUser};