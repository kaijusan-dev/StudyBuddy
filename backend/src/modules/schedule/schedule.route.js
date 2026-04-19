import express from 'express'
import * as scheduleController from './schedule.controller.js';
import { validate } from '#app';
import { calendarUrlSchema } from './schedule.schemas.js';

export const scheduleRouter = express.Router();

scheduleRouter.get('/', scheduleController.getSchedule);

scheduleRouter.post('/:id/complete', scheduleController.completeEvent);

scheduleRouter.post('/update', validate(calendarUrlSchema), scheduleController.obtainingSchedule);
