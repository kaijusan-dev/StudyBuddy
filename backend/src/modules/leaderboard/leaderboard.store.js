import * as leaderboardRepository from "./leaderboard.repository.js";

const leaderboardStore = {
    topPlayers: [],
    playersMap: new Map(),
    updatedAt: null
};

export function getLeaderboardStore() {
    return leaderboardStore;
}

export async function refreshLeaderboard() {

    console.log("Refreshing leaderboard...");

    const players = await leaderboardRepository.getTopPlayers();

    leaderboardStore.topPlayers = players;

    leaderboardStore.playersMap.clear();

    for (const player of players) {
        leaderboardStore.playersMap.set(
            player.id,
            player
        );
    }

    leaderboardStore.updatedAt = new Date();

    console.log("Leaderboard refreshed");
}

export async function initializeLeaderboardStore() {

    // первая загрузка
    await refreshLeaderboard();

    // обновление каждые 5 минут
    setInterval(async () => {

        try {
            await refreshLeaderboard();
        }
        catch(err) {
            console.error(
                "Leaderboard refresh failed:",
                err
            );
        }

    }, 60000 * 5);
}