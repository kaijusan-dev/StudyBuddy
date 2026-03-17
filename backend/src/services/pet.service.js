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

  const hunger = Math.min(pet.hunger + 20, 100);

  return await petRepository.updatePet(userId, {
    hunger
  });
};