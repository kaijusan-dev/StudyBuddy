import * as petRepository from "./pet.repository.js";
import { findUserById } from "#auth";
import { PET_BALANCE } from "./pet.balance.js";
import { activePets, clients, handlePetUpdate } from "#app";

const clampStat = (key, value) => {
  const maxMap = {
    fullness: PET_BALANCE.FULLNESS.MAX,
    energy: PET_BALANCE.ENERGY.MAX,
    happiness: PET_BALANCE.HAPPINESS.MAX,
  };

  const max = maxMap[key] ?? Infinity;

  if (Number.isNaN(value)) return 0;

  if (key === "coins") {
    return Math.max(0, Math.round(value));
  }

  return Math.max(0, Math.min(max, value));
};

const calculateEnergyRecovery = (lastDate, nowDate) => {
  let total = 0;
  let current = new Date(lastDate);
  const end = new Date(nowDate);

  while (current < end) {
    const nextHour = new Date(current);
    nextHour.setHours(current.getHours() + 1, 0, 0, 0);
    const segmentEnd = nextHour > end ? end : nextHour;
    const hoursDiff = (segmentEnd - current) / (1000 * 3600);

    const hour = current.getHours();
    const isNight = hour >= 22 || hour < 6; // ночь с 22:00 до 6:00
    const rate = isNight
      ? PET_BALANCE.ENERGY.NIGHT_RECOVERY_PER_HOUR
      : PET_BALANCE.ENERGY.RECOVERY_PER_HOUR;

    total += rate * hoursDiff;
    current = segmentEnd;
  }

  return total;
};

export const calculatePetState = (pet) => {
  const now = new Date();
  const lastUpdated = new Date(pet.last_updated);
  const diffDays = (now - lastUpdated) / (1000 * 3600 * 24);

  // Спад сытости
  const decayPerDay = PET_BALANCE.FULLNESS.DECAY_PER_DAY(pet.level);
  let newFullness = pet.fullness - decayPerDay * diffDays;

  // Восстановление энергии
  const energyRecovery = calculateEnergyRecovery(lastUpdated, now);
  let newEnergy = pet.energy + energyRecovery;

  // Спад счастья (если задан)
  let newHappiness = pet.happiness;
  if (PET_BALANCE.HAPPINESS.DECAY_PER_DAY) {
    const happinessDecay = PET_BALANCE.HAPPINESS.DECAY_PER_DAY * diffDays;
    newHappiness = pet.happiness - happinessDecay;
  }

  // Применяем ограничения
  newFullness = clampStat("fullness", newFullness);
  newEnergy = clampStat("energy", newEnergy);
  newHappiness = clampStat("happiness", newHappiness);

  // До целых чисел кроме сытости
  newEnergy = Math.round(newEnergy);
  newHappiness = Math.round(newHappiness);

  return {
    ...pet,
    fullness: newFullness,
    energy: newEnergy,
    happiness: newHappiness,
    last_updated: now,
  };
};

export const getPet = async (userId) => {

  // Сначала проверяем, есть ли питомец в активной памяти (онлайн)
  if (activePets.has(userId)) {
    return activePets.get(userId);
  }

  // Если нет – загружаем из БД
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

export const updatePet = async (userId, field, value) => {
  let pet = await getPet(userId);
  pet = { ...pet, [field]: value, last_updated: new Date() };
  const updated = calculatePetState(pet);
  await petRepository.updatePet(userId, updated);
  if (activePets.has(userId)) {
    activePets.set(userId, updated);
    const ws = clients.get(userId);
    if (ws) await handlePetUpdate(userId, updated, ws, "idle");
  }
  return updated;
};

export const savePet = async (userId, pet) => {
  return await petRepository.updatePet(userId, pet);
};

// Применяет действие (FEED, PLAY, CARESS) и синхронизирует с WebSocket
export const applyAction = async (userId, action, animation) => {
  let pet = activePets.get(userId);
  if (!pet) pet = await getPet(userId);
  const updated = applyActionLogic(pet, action);
  const ws = clients.get(userId);
  await handlePetUpdate(userId, updated, ws, animation);
  return updated;
};

// Чистая функция применения действия
const applyActionLogic = (pet, action) => {
  const config = PET_BALANCE.ACTIONS[action];
  if (!config) return pet;

  const base = calculatePetState(pet);
  let coinsDelta = 0;
  let energyDelta = config.energy || 0;
  let happinessDelta = config.happiness || 0;
  let fullnessDelta = config.fullness || 0;
  let xpDelta = config.xp || 0;

  if (action === "FEED") {
    if (base.fullness >= 20) throw new Error("Питомец не голоден!");
    const cost = base.fullness <= 9 ? PET_BALANCE.COINS.FEED_HUNGRY_COST : PET_BALANCE.COINS.FEED_NORMAL_COST;
    if (base.coins < cost) throw new Error("Не хватает монет!");
    coinsDelta = -cost;
  }

  if (energyDelta < 0 && base.energy + energyDelta < 0) throw new Error("Недостаточно энергии!");

  const result = { ...base };
  result.fullness = clampStat("fullness", base.fullness + fullnessDelta);
  result.happiness = clampStat("happiness", base.happiness + happinessDelta);
  result.energy = clampStat("energy", base.energy + energyDelta);
  result.xp = clampStat("xp", (base.xp || 0) + xpDelta);
  result.coins = clampStat("coins", (base.coins || 0) + coinsDelta);
  if (config.feed_count) result.feed_count = (result.feed_count || 0) + config.feed_count;
  result.last_updated = new Date();
  return result;
};

// Обёртки для конкретных действий (для удобства)
export const feedPet = (userId) => applyAction(userId, "FEED", "eat");
export const playWithPet = (userId) => applyAction(userId, "PLAY", "play");
export const caressPet = (userId) => applyAction(userId, "CARESS", "caress");

export const deletePet = async (userId) => {
  const ws = clients.get(userId);
  if (ws) {
    ws.close();
    clients.delete(userId);
    activePets.delete(userId);
  }
  await petRepository.deletePetByUserId(userId);
};

export const applyLessonReward = (pet) => {
  const updated = { ...pet };
  
  // Тратим энергию
  updated.energy = clampStat('energy', updated.energy - PET_BALANCE.ENERGY.PER_LESSON);
  // Добавляем опыт
  updated.xp = (updated.xp || 0) + PET_BALANCE.XP.LESSON;
  
  // Сытость всегда увеличивается за урок
  updated.fullness = clampStat('fullness', updated.fullness + PET_BALANCE.FULLNESS.PER_LESSON);
  
  // Монета даётся, если после прибавки сытость >= 20 (или если уже был сыт)
  if (updated.fullness >= PET_BALANCE.FULLNESS.ZONES.FULL[0]) {
    updated.coins = clampStat('coins', (updated.coins || 0) + PET_BALANCE.COINS.EXTRA_LESSON);
  }
  
  updated.last_updated = new Date();
  return updated;
};