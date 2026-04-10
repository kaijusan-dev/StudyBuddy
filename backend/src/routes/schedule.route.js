import express from 'express'
import * as scheduleController from '../controllers/schedule.controller.js';
import { validate } from '../middlewares/validate.js';
import { calendarUrlSchema } from '../schemas/schedule.schemas.js';

const scheduleRouter = express.Router();

scheduleRouter.get('/', scheduleController.getSchedule);

scheduleRouter.post('/:id/complete', scheduleController.completeEvent);

scheduleRouter.post('/update', validate(calendarUrlSchema), scheduleController.obtainingSchedule);

export default scheduleRouter;