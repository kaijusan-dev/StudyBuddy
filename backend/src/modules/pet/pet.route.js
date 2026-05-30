import express from 'express';
import * as petController from './pet.controller.js';
import { feedPet, playPet, dailyBonus, healPet } from '../controllers/pet.controller.js';

export const petRouter = express.Router();

petRouter.get('/', petController.getPet);
petRouter.post('/:id/complete', petController.getPet);
petRouter.post('/update', petController.updatePet);

petRouter.post('/feed', feedPet);
petRouter.post('/play', playPet);
petRouter.post('/daily', dailyBonus);
petRouter.post('/heal', healPet);

export default petRouter;
