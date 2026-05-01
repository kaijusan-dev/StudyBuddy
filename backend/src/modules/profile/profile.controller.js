import * as profileService from './profile.service.js';

export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await profileService.updateProfile(req.user.id, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateTelegramId = async (req, res) => {
    try {
        const updatedUser = await profileService.updateTelegramId(req.user.id, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};