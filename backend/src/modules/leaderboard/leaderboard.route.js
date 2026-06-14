import express from "express";
import * as leaderboardController from "./leaderboard.controller.js";
import {authMiddleware} from "../auth/auth.middleware.js";

export const leaderboardRouter = express.Router();

leaderboardRouter.get("/", authMiddleware, leaderboardController.getLeaderboard);
