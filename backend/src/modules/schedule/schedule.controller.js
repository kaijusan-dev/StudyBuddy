import { updateSchedule } from "./schedule.repository.js";
import * as scheduleService from "./schedule.service.js";
import * as petService from "#pet";
import {PET_BALANCE} from "#pet";
import { updateActivePet } from "#app";

const getSchedule = async (req, res) => {
    try {
        const result = await scheduleService.getScheduleFromDB(req.user.id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
};

const getTodaySchedule = async (req, res) => {
    try {
        const lessons = await scheduleService.getTodayLessons(req.user.id);
        res.json({ lessons });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get schedule' });
    }
};

const completeEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedEvent = await updateSchedule(id, req.user.id, {
            completed: true
        });

        const pet = await petService.getPet(req.user.id);

        const resultPet = petService.applyLessonReward(pet);

        await petService.savePet(req.user.id, resultPet);

        updateActivePet(req.user.id, resultPet);

        res.json({
            message: 'Task marked as complete',
            pet: resultPet,
            event: updatedEvent,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

const obtainingSchedule = async (req, res) => {
    try {
        console.log(req.body);
        const {calendar_url} = req.body;
        const user_id = req.user.id;
        await scheduleService.fetchAndSaveSchedule(calendar_url, user_id);
        res.status(200).json({ message: 'Schedule updated' });
    } catch (err) {
        console.error(err);

        res.status(400).json({
            message: err.message
        });
    }
}

export { getSchedule, completeEvent, obtainingSchedule, getTodaySchedule };