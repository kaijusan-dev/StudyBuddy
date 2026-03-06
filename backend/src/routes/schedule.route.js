import express from 'express'
import {pool} from '../db.js';

const scheduleRouter = express.Router();

scheduleRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM schedule WHERE group_id = $1', [17]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// scheduleRouter.post('/update', async (req, res) => {
//     try {
//         const calendarUrl = 'https://ical.psu.ru/calendars/R5CGGG87TW36X3D6';
//         await fetchAndSaveSchedule(calendarUrl);
//         res.json({ message: 'Schedule updated' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to update schedule' });
//     }
// });

export default scheduleRouter;