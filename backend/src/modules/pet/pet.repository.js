import { pool } from "#infra";

const findPetByUserId = async (user_id) => {
    const res = await pool.query(`
        SELECT * FROM pets WHERE user_id = $1`, 
        [user_id]
    )
    return res.rows[0] || null;
};

const updatePet = async (user_id, data) => {

    if (Object.keys(data).length === 0) {
        throw new Error("No fields to update");
    }

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
    }

    values.push(user_id);

    const query = `
        UPDATE pets
        SET ${fields.join(', ')}
        WHERE user_id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
}

const createPet = async (user_id) => {
  const res = await pool.query(
    `INSERT INTO pets (user_id)
     VALUES ($1)
     RETURNING *`,
    [user_id]
  )
  return res.rows[0]
};

export {findPetByUserId, updatePet, createPet};