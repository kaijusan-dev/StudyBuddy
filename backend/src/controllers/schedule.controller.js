import { updateSchedule } from "../repositories/schedule.repository.js";
import * as scheduleService from "../services/schedule.service.js";

const getSchedule = async (req, res) => {
    try {
        const result = await scheduleService.getScheduleFromDB(req.user.id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
};

const completeEvent = async (req, res) => {
    const { id } = req.params;

    try {
        await updateSchedule(id, req.user.id, { completed: true });
        res.json({ message: 'Task marked as complete' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
}

const obtainingSchedule = async (req, res) => {
    try {
        console.log(req.body);
        const {calendar_url} = req.body;
        const user_id = req.user.id;
        await scheduleService.fetchAndSaveSchedule(calendar_url, user_id);
        res.status(200).json({ message: 'Schedule updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
}

export { getSchedule, completeEvent, obtainingSchedule };