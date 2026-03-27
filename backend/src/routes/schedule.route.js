import express from 'express'
import { fetchAndSaveSchedule, getScheduleFromDB } from '../services/schedule.service.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { updateSchedule } from '../repositories/schedule.repository.js';
import { validate } from '../middlewares/validate.js';
import { calendarUrlSchema } from '../schemas/schedule.schemas.js';

const scheduleRouter = express.Router();

scheduleRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await getScheduleFromDB(req.user.id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

scheduleRouter.post('/:id/complete', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        await updateSchedule(id, { completed: true });
        res.json({ message: 'Task marked as complete' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

scheduleRouter.post('/update', authMiddleware, validate(calendarUrlSchema), async (req, res) => {
    try {
        console.log(req.body);
        const {calendar_url} = req.body;
        const user_id = req.user.id;
        await fetchAndSaveSchedule(calendar_url, user_id);
        res.json({ message: 'Schedule updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

export default scheduleRouter;