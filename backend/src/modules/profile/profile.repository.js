import { pool } from "#infra";

const updateUser = async (id, data) => {

    if (Object.keys(data).length === 0) {
        throw new Error("No fields to update");
    }

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
        if (key === 'role') continue;
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
    }

    values.push(id);

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING id, username, email, group_id, avatar
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
}

export {updateUser};