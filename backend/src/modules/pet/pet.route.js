import express from 'express'
import * as petController from './pet.controller.js';
import {authMiddleware} from "../auth/auth.middleware.js";

export const petRouter = express.Router();

// GET /api/pet – получить питомца
petRouter.get('/', authMiddleware, petController.getPet);

// POST /api/pet/feed – покормить
petRouter.post('/feed', authMiddleware, petController.feedPet);

// POST /api/pet/play – поиграть
petRouter.post('/play', authMiddleware, petController.playPet);

// POST /api/pet/caress – погладить
petRouter.post('/caress', authMiddleware, petController.caressPet);

// DELETE /api/pet – удалить питомца
petRouter.delete('/', authMiddleware, petController.deletePet);

// обновить питомца
petRouter.post('/update', authMiddleware, petController.updatePet);