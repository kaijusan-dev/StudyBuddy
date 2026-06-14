import * as achievementsRepository from './achievements.repository.js'

export const getAchievements = async (req, res) => {
  const userId = req.user.id;

  const achievements = await achievementsRepository.getUserAchievements(userId);

  console.log('achievements: ', achievements);

  res.json(achievements);
};