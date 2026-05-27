import express from 'express'
import * as scheduleController from './schedule.controller.js';
import { validate } from '#app';
import { calendarUrlSchema } from './schedule.schemas.js';
import {authMiddleware} from "../auth/auth.middleware.js";

export const scheduleRouter = express.Router();

scheduleRouter.get('/', authMiddleware, scheduleController.getSchedule);

scheduleRouter.post('/:id/complete', authMiddleware, scheduleController.completeEvent);

scheduleRouter.post('/update', authMiddleware, validate(calendarUrlSchema), scheduleController.obtainingSchedule);
