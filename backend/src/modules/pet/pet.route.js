import express from 'express'
import * as petController from './pet.controller.js';

export const petRouter = express.Router();

petRouter.get('/', petController.getPet);

petRouter.post('/:id/complete', petController.getPet);

petRouter.post('/update', petController.updatePet);
