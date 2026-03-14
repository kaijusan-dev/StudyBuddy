import * as uploadService from '../services/upload.service.js';

export const updateAvatarController = async (req, res) => {
    try {
        const updatedUser = await uploadService.updateAvatar(req.user.id, req.file.path);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

