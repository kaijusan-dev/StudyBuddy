import express from 'express'
import * as achievementsController from './achievements.controller.js'
import {authMiddleware} from "../auth/auth.middleware.js";

export const achievementsRouter = express.Router();

achievementsRouter.get('/', authMiddleware, achievementsController.getAchievements);