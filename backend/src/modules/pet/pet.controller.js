const pets = new Map();

function getOrCreatePet(userId) {
    if (!pets.has(userId)) {
        pets.set(userId, {
            fullness: 80,
            happiness: 70,
            energy: 80,
            level: 1,
            xp: 0,
            coins: 50,
            lastDaily: null
        });
    }
    return pets.get(userId);
}

export const getPet = (req, res) => {
    const pet = getOrCreatePet(req.user.id);
    res.json(pet);
};

export const feedPet = (req, res) => {
    const pet = getOrCreatePet(req.user.id);
    pet.fullness = Math.min(100, pet.fullness + 20);
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.xp += 3;
    while (pet.xp >= 100 * pet.level) {
        pet.xp -= 100 * pet.level;
        pet.level++;
    }
    res.json(pet);
};

export const playPet = (req, res) => {
    const { result } = req.body;
    const pet = getOrCreatePet(req.user.id);
    if (result === 'win') {
        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.energy = Math.max(0, pet.energy - 5);
        pet.coins += 5;
        pet.xp += 5;
    } else if (result === 'lose') {
        pet.happiness = Math.max(0, pet.happiness - 2);
        pet.energy = Math.max(0, pet.energy - 5);
    } else { // draw
        pet.energy = Math.max(0, pet.energy - 2);
    }
    while (pet.xp >= 100 * pet.level) {
        pet.xp -= 100 * pet.level;
        pet.level++;
    }
    res.json(pet);
};

export const dailyBonus = (req, res) => {
    const pet = getOrCreatePet(req.user.id);
    const today = new Date().toDateString();
    if (pet.lastDaily === today) {
        return res.status(400).json({ error: 'Already claimed today' });
    }
    pet.lastDaily = today;
    pet.coins += 10;
    pet.xp += 10;
    pet.happiness = Math.min(100, pet.happiness + 10);
    res.json({ message: 'Daily bonus claimed', coins: pet.coins, xp: pet.xp, happiness: pet.happiness });
};

export const healPet = (req, res) => {
    const pet = getOrCreatePet(req.user.id);
    const cost = 200;
    if (pet.coins < cost) {
        return res.status(400).json({ error: 'Not enough coins' });
    }
    pet.coins -= cost;
    pet.happiness = Math.min(100, pet.happiness + 30);
    pet.energy = Math.min(100, pet.energy + 20);
    res.json(pet);
};
