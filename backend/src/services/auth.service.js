import {pool} from "../db.js";

async function saveUserToDB(user) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO users (nickname, email, group_id, password) 
                VALUES ($1, $2, $3, $4)
            `,
            [user.nickname, user.email, user.group_id, user.password]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export { saveUserToDB };