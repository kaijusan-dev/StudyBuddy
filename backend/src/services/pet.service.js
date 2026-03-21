import * as petRepository from "../repositories/pet.repository.js";

const calculateFullness = (pet) => {
  const now = Date.now();
  const diff = (now - pet.last_updated) / 1000;

  const fullnessDecrease = diff * 0.1;

  return Math.max(0, pet.fullness - fullnessDecrease);
}

export const getPet = async (userId) => {

  let pet = await petRepository.findPetByUserId(userId);
  
  if (!pet) {
      pet = await petRepository.createPet(userId);
    }

  pet.fullness = calculateFullness(pet);

  return pet;
};

export const feedPet = async (userId) => {

  const pet = await petRepository.findPetByUserId(userId);

  if (!pet) {
    pet = await petRepository.createPet(userId);
  }

  const newFullness = Math.min(calculateFullness(pet) + 20, 100);

  const updatedPet = {
    ...pet,
    fullness: newFullness,
    last_updated: new Date()
  }

  return await petRepository.updatePet(userId, updatedPet);
};