import * as leaderboardService from "./leaderboard.service.js";

export async function getLeaderboard(req, res, next) {
    try {
        const leaderboard = await leaderboardService.getLeaderboard();

        res.json(leaderboard);

    } catch (err) {
        next(err);
    }
}