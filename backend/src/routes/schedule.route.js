import express from 'express'
import pool from '../db.js';
import { fetchAndSaveSchedule } from '../services/schedule.service.js';

const scheduleRouter = express.Router();

scheduleRouter.get('/', async (req, res) => {
    try {
        const calendarUrl = 'https://ical.psu.ru/calendars/R5CGGG87TW36X3D6';

        console.log('Fetching schedule from URL:', calendarUrl);

        await fetchAndSaveSchedule(calendarUrl);

        console.log('Schedule fetched and saved to DB, now fetching from DB');

        const result = await pool.query('SELECT * FROM schedule WHERE group_id = $1', [17]);

        console.log('Schedule fetched from DB:', result.rows);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

export default scheduleRouter;