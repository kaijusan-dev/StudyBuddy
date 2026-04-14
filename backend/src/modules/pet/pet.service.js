import * as petRepository from "./pet.repository.js";

export const applyDecay = (pet) => {
  const now = Date.now();
  const last = new Date(pet.last_updated).getTime();

  const diffSec = (now - last) / 1000;
  const decayRate = 0.8;

  return {
    ...pet,
    fullness: Math.max(0, pet.fullness - diffSec * decayRate),
  };
};

export const syncPet = async (userId) => {
  let pet = await petRepository.findPetByUserId(userId);
  if (!pet) pet = await petRepository.createPet(userId);

  const updated = applyDecay(pet);

  return await petRepository.updatePet(userId, {
    ...updated,
    last_updated: new Date(),
  });
};

export const getPet = async (userId) => {
  let pet = await petRepository.findPetByUserId(userId);
  if (!pet) pet = await petRepository.createPet(userId);
  return applyDecay(pet);
};

export const feedPet = async (userId) => {
  const pet = await syncPet(userId);

  const newFullness = Math.min(pet.fullness + 20, 100);

  return await petRepository.updatePet(userId, {
    ...pet,
    fullness: newFullness,
    last_updated: new Date(),
  });
};

export const updatePet = async (userId, field, value) => {
  const pet = await syncPet(userId);

  return await petRepository.updatePet(userId, {
    ...pet,
    [field]: value,
    last_updated: new Date(),
  });
};

