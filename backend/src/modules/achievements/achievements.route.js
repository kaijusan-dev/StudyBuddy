import express from 'express'
import * as achievementsController from './achievements.controller.js'

export const achievementsRouter = express.Router();

achievementsRouter.get('/', achievementsController.getAchievements);