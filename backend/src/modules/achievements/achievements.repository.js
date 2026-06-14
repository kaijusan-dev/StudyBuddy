import { findUserById } from '#auth';
import { updateUser } from '#profile';

export const getUserAchievements = async (userId) => {
  const user = await findUserById(userId);
  return user.achievements ?? [];
};

export const saveUserAchievements = async (userId, achievements) => {
  return updateUser(userId, {
    achievements: JSON.stringify(achievements || []),
  });
};