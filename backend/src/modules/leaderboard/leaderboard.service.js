import * as leaderboardRepository from "./leaderboard.repository.js";

export async function getLeaderboard(userId) {

    const topPlayers = await leaderboardRepository.getTopPlayers();

    const userRank = await leaderboardRepository.getUserRank(userId);

    return {
        topPlayers,
        userRank
    };
}