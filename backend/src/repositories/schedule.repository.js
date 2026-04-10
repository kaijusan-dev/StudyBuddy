import {pool} from '../db.js';

async function getSchedule(user_id) {
    const res = await pool.query('SELECT * FROM schedule WHERE user_id = $1', [user_id]);
    return res.rows;
}

async function getScheduleUrl(user_id) {
    const res = await pool.query('SELECT calendar_url FROM users WHERE id = $1', [user_id]);
    return res.rows[0] ? res.rows[0].calendar_url : null;
}

async function saveSchedule(schedule, user_id) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'DELETE FROM schedule WHERE user_id = $1',
            [user_id]
        );

        for (const event of schedule) {
            await client.query(
                `INSERT INTO schedule (start_time, end_time, summary, user_id, completed)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    event.start,
                    event.end,
                    event.summary,
                    user_id,
                    event.completed || false
                ]
            );
        }

        await client.query('COMMIT');

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

const updateSchedule = async (id, user_id, data) => {
    if (Object.keys(data).length === 0) {
        throw new Error("No fields to update");
    }

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
        if (key === 'user_id') continue;
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
    }

    values.push(id);
    values.push(user_id);

    const query = `
        UPDATE schedule
        SET ${fields.join(', ')}
        WHERE id = $${index} AND user_id = $${index + 1}
        RETURNING id, start_time, end_time, summary, user_id, completed
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

const addEventToSchedule = async (event) => {
    const {
        start_time,
        end_time,
        summary,
        user_id
    } = event;

    const query = `
        INSERT INTO schedule (start_time, end_time, summary, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const res = await pool.query(query, [
        start_time,
        end_time,
        summary,
        user_id
    ]);

    return res.rows[0] || null;
};

const deleteEventFromSchedule = async (id) => {

    const query = `
        DELETE FROM schedule WHERE id = $1 RETURNING *;
    `;

    const res = await pool.query(query, [
        id,
    ]);

    return res.rows[0] || null;
};

export { getSchedule, saveSchedule, getScheduleUrl, updateSchedule, addEventToSchedule, deleteEventFromSchedule };