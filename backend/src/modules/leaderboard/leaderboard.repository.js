import {pool} from "../../infrastructure/db.js";

export async function getTopPlayers() {

    const query = `
        SELECT
            users.id,
            users.username,
            users.avatar,

            pets.xp,
            pets.level

        FROM pets

        JOIN users
            ON users.id = pets.user_id

        ORDER BY pets.xp DESC

        LIMIT 100
    `;

    const result = await pool.query(query);

    return result.rows;
}

export async function getUserRank(userId) {

    const query = `
        SELECT COUNT(*) + 1 AS rank
        FROM pets
        WHERE xp > (
            SELECT xp FROM pets WHERE user_id = $1
        )
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0]?.rank ?? null;
}