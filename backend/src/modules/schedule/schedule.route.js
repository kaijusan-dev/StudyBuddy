import express from 'express'
import * as scheduleController from './schedule.controller.js';
import { validate } from '#app';
import { calendarUrlSchema } from './schedule.schemas.js';
import {authMiddleware} from "../auth/auth.middleware.js";

export const scheduleRouter = express.Router();

// GET /api/schedule/ – расписание целиком
scheduleRouter.get('/', authMiddleware, scheduleController.getSchedule);

// GET /api/schedule/ – отметить пару
scheduleRouter.post('/:id/complete', authMiddleware, scheduleController.completeEvent);

// POST /api/schedule/ – обновить расписание (админ)
scheduleRouter.post('/update', authMiddleware, validate(calendarUrlSchema), scheduleController.obtainingSchedule);

// GET /api/schedule/today – расписание на сегодня
scheduleRouter.get('/today', authMiddleware, scheduleController.getTodaySchedule);