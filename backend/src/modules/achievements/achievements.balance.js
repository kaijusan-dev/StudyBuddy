export const ACHIEVEMENTS = {
  FIRST_FEED: {
    title: "Первый корм",
    description: "Feed your pet for the first time",
    check: (pet) => pet.feed_count >= 1,
  },

  HUNGRY_SURVIVOR: {
    title: "Выживший",
    description: "Let fullness drop below 5",
    check: (pet) => pet.fullness < 5,
  },

  STUDY_HARD: {
    title: "Задрот",
    description: "Gain 100 XP",
    check: (pet) => pet.xp >= 100,
  },
};