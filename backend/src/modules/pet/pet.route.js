import express from 'express';
import { getPet, feedPet, playPet, dailyBonus, healPet } from '../controllers/pet.controller.js';

export const petRouter = express.Router();

petRouter.get('/', getPet);
petRouter.post('/feed', feedPet);
petRouter.post('/play', playPet);
petRouter.post('/daily', dailyBonus);
petRouter.post('/heal', healPet);
