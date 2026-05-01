import * as petRepository from "./pet.repository.js";

export const calculatePetState = (pet) => {
  const now = Date.now();
  const last = new Date(pet.last_updated).getTime();

  const diffSec = (now - last) / 1000;

  const decayRate = 0.8;

  return {
    ...pet,
    fullness: Math.max(0, pet.fullness - diffSec * decayRate),
  };
};

export const getPet = async (userId) => {
  let pet = await petRepository.findPetByUserId(userId);
  if (!pet) pet = await petRepository.createPet(userId);
  return calculatePetState(pet);
};

export const feedPet = async (userId, pet) => {
  const newFullness = Math.min(pet.fullness + 20, 100);

  return await petRepository.updatePet(userId, {
    ...pet,
    fullness: newFullness,
    last_updated: new Date(),
  });
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