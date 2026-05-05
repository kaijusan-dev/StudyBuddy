import * as petService from "./pet.service.js";

const getPet = async (req, res) => {
    try {
        const result = await petService.getPet(req.user.id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
};

const updatePet = async (req, res) => {
    try {
        const pet = petService.getPet(req.user.id);
        const result = await updatePet(req.user.id, pet, req.body.field, request.body.value);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update pet' });
    }
}

const savePet = async (req, res) => {
    try {
        const result = await petService.savePet(req.user.id, req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save pet' });
    }
}
export { getPet, updatePet, savePet };