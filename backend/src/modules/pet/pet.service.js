import * as petRepository from "./pet.repository.js";
import { findUserById } from "#auth";
import { PET_BALANCE } from "./pet.balance.js";

export const calculatePetState = (pet) => {
  const now = Date.now();
  const last = new Date(pet.last_updated).getTime();

  const diffSec = (now - last) / 1000;
  const diffDays = diffSec / 86400;

  const decayPerDay = PET_BALANCE.FULLNESS.DECAY_PER_DAY(pet.fullness);

  const decay = decayPerDay * diffDays;

  return {
    ...pet,
    fullness: clampStat('fullness', pet.fullness - decay)
  };
};

export const getPet = async (userId) => {
  let pet = await petRepository.findPetByUserId(userId);
  if (!pet) {

    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    pet = await petRepository.createPet(userId);
  }

  return calculatePetState(pet);
};

export const updatePet = async (userId, pet, field, value) => {

  const currentPet = await calculatePetState(pet);

  return await petRepository.updatePet(userId, {
    ...currentPet,
    [field]: value,
    last_updated: new Date(),
  });
};

export const savePet = async (userId, pet) => {
  return await petRepository.updatePet(userId, pet);
};

const clampStat = (key, value) => {
  const maxMap = {
    fullness: PET_BALANCE.FULLNESS.MAX,
    energy: PET_BALANCE.ENERGY.MAX,
    happiness: PET_BALANCE.HAPPINESS.MAX,
  };

  const max = maxMap[key] ?? Infinity;

  if (Number.isNaN(value)) return 0;

  return Math.max(0, Math.min(max, value));
};

export const applyAction = (pet, action) => {
  const config = PET_BALANCE.ACTIONS[action];
  if (!config) return pet;

  const base = calculatePetState(pet);
  const result = { ...base };

  for (const key in config) {
    const current = result[key] ?? 0;
    const delta = config[key];

    result[key] = clampStat(key, current + delta);
  }

  return {
    ...result,
    last_updated: new Date(),
  };
};