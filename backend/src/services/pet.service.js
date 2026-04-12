import * as petRepository from "../repositories/pet.repository.js";

export const getPet = async (userId) => {

  let pet = await petRepository.findPetByUserId(userId);

  if (!pet) {
    pet = await petRepository.createPet(userId);
  }

  return pet;
};

export const feedPet = async (userId) => {

  const pet = await petRepository.findPetByUserId(userId);

  if (!pet) {
    pet = await petRepository.createPet(userId);
  }

  const now = Date.now();

  const diffSec = (now - pet.last_updated) / 1000;
  const decayRate = 0.1;

  const decayedFullness = Math.max(
    0,
    pet.fullness - diffSec * decayRate
  );

  const newFullness = Math.min(decayedFullness + 20, 100);

  const updatedPet = {
    ...pet,
    fullness: newFullness,
    last_updated: new Date()
  };

  return await petRepository.updatePet(userId, updatedPet);
};