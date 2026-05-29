import { pool } from "#infra";

const getAllUsers = async () => {
    const res = await pool.query(
        `SELECT id, username, email, group_id, role FROM users`
    );
    return res.rows;
};

const toggleUserRole = async (id) => {
    const result = await pool.query(
        `SELECT role FROM users WHERE id = $1`, 
        [id]
    );

    const user = result.rows[0];

    if (!user) throw new Error("user not found");    

    const currentRole = user.role;

    const newRole = currentRole === "admin" ? "user" : "admin";

    const res = await pool.query(
        `UPDATE users SET role = $1  WHERE id = $2 RETURNING *`, 
        [newRole, id]
    );

    return res.rows[0] || null;
};

const deleteUser = async (id) => {
    const res = await pool.query(
        `DELETE FROM users WHERE id = $1`, 
        [id] 
    );
    return res.rows[0] || null;
};

const setPetXp = async (userId, xp) => {
    const res = await pool.query(
        `
        UPDATE pets
        SET xp = $1
        WHERE user_id = $2

        RETURNING
            user_id,
            xp,
            level
        `,
        [xp, userId]
    );

    return res.rows[0] || null;
};

const setPetLevel = async (userId, level) => {
    const res = await pool.query(
        `
        UPDATE pets
        SET level = $1
        WHERE user_id = $2

        RETURNING
            user_id,
            xp,
            level
        `,
        [level, userId]
    );

    return res.rows[0] || null;
};

export {getAllUsers, toggleUserRole, deleteUser, setPetXp, setPetLevel};