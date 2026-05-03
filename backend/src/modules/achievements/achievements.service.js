import { ACHIEVEMENTS } from "./achievements.balance.js";
import * as achievementsRepository from "./achievements.repository.js";

export const evaluateAchievements = async (userId, ctx) => {
  const unlocked = await achievementsRepository.getUserAchievements(userId);

  const newUnlocked = [];

  for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (unlocked.includes(key)) continue;

    if (achievement.check(ctx)) {
      newUnlocked.push(key);
    }
  }

  if (!newUnlocked.length) return [];

  const updated = [...unlocked, ...newUnlocked];

  console.log('unlocked achievements: ', newUnlocked);

  await achievementsRepository.saveUserAchievements(userId, updated);

  return newUnlocked;
};