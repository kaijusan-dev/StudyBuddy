import * as petService from "./pet.service.js";

const getPet = async (req, res) => {
  try {
    const pet = await petService.getPet(req.user.id);
    // сытость в проценты для бота
    const responsePet = {
      ...pet,
      fullnessPercent: Math.round(pet.fullness / 30 * 100),
    };
    res.json(responsePet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
};

const updatePet = async (req, res) => {
  try {
    const { field, value } = req.body;
    const updated = await petService.updatePet(req.user.id, field, value);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update pet' });
  }
};

const savePet = async (req, res) => {
  try {
    const updated = await petService.savePet(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save pet' });
  }
};

const feedPet = async (req, res) => {
  try {
    let pet = await petService.getPet(req.user.id);
    const oldFullnessPercent = Math.round(pet.fullness / 30 * 100);
    
    const updated = await petService.feedPet(req.user.id);
    res.json({
      old_fullness: oldFullnessPercent,
      new_fullness: Math.round(updated.fullness / 30 * 100),
      happiness: updated.happiness,
      coins: updated.coins,
      xp: updated.xp,
      energy: updated.energy
    });
  } catch (err) {
    console.error(err);
    const message = err.message === "Питомец не голоден!" || err.message === "Не хватает монет!"
      ? err.message
      : "Failed to feed pet";
    res.status(400).json({ error: message });
  }
};

const playPet = async (req, res) => {
  try {
    const updated = await petService.playWithPet(req.user.id);
    res.json({
      happiness: updated.happiness,
      energy: updated.energy,
      coins: updated.coins,
      xp: updated.xp
    });
  } catch (err) {
    console.error(err);
    const message = err.message === "Недостаточно энергии!" ? err.message : "Failed to play with pet";
    res.status(400).json({ error: message });
  }
};

const caressPet = async (req, res) => {
  try {
    const updated = await petService.caressPet(req.user.id);
    res.json({
      happiness: updated.happiness,
      energy: updated.energy,
      coins: updated.coins,
      xp: updated.xp
    });
  } catch (err) {
    console.error(err);
    const message = err.message === "Недостаточно энергии!" ? err.message : "Failed to caress pet";
    res.status(400).json({ error: message });
  }
};

const deletePet = async (req, res) => {
  try {
    await petService.deletePet(req.user.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
};

export { getPet, updatePet, savePet, feedPet, playPet, caressPet, deletePet };