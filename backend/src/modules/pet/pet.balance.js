export const PET_BALANCE = {
  FULLNESS: {
    MAX: 30,
    ZONES: {
      HUNGRY: [0, 9],
      NORMAL: [10, 19],
      FULL: [20, 30],
    },
    DECAY_PER_DAY: (level) => {
      if (level < 10) return 4;
      if (level < 20) return 3;
      return 2;
    },
    PROTECTION_DAYS: 2,
    PER_LESSON: 2,
  },

  ENERGY: {
    MAX: 100,
    PER_LEVEL_BONUS: 0.02,
    RECOVERY_PER_HOUR: 2,
    NIGHT_RECOVERY_PER_HOUR: 4,
    MIN_FOR_GAME: 5,
    RPS_COST: 5,
    FEED_COST: 3,
    PER_LESSON: 10,
  },

  HAPPINESS: {
    MAX: 100,
    PER_LEVEL_BONUS_PERCENT: 0.01,
    DECAY_PER_DAY: 2,
  },

  XP: {
    LESSON: 15,
    RPS_WIN: 5,
    RPS_LOSS: 1,
    RPS_DRAW: 2,
    FEED: 3,
    DAILY: 5,
    FORMULA: (level) => Math.round(100 * Math.pow(1.25, level - 1)),
  },

  COINS: {
    STREAK_3_0: 3,
    DAILY: 1,
    EXTRA_LESSON: 1,

    FEED_NORMAL_COST: 5,
    FEED_HUNGRY_COST: 10,
  },

  ACTIONS: {
    FEED: {
      fullness: 10,
      xp: 3,
      feed_count: 1
    },

    CARESS: {
      happiness: 5,
      energy: -5,
      xp: 2,
    },

    PLAY: {
      energy: -10,
      happiness: 15,
      xp: 3,
    },
  },
};