import {pool} from "../../infrastructure/db.js";
import {calculateLevel} from "#pet";

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
    const players = result.rows.map(player => ({
        ...player,
        level: calculateLevel(player.xp || 0)
    }));
    return players;
}

export async function getUserRank(userId) {

    const query = `
        SELECT CASE
            WHEN EXISTS (SELECT 1 FROM pets WHERE user_id = $1) THEN
                (SELECT COUNT(*) + 1 FROM pets WHERE xp > (SELECT xp FROM pets WHERE user_id = $1))
            ELSE NULL
        END AS rank;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0]?.rank ?? null;
}