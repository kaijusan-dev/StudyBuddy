import express from 'express'
import * as petController from './pet.controller.js';
import {authMiddleware} from "../auth/auth.middleware.js";

export const petRouter = express.Router();

petRouter.get('/', authMiddleware, petController.getPet);

petRouter.post('/:id/complete', authMiddleware, petController.getPet);

petRouter.post('/update', authMiddleware, petController.updatePet);
