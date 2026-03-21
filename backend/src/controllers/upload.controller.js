import * as uploadService from '../services/upload.service.js';

export const updateAvatarController = async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const avatarFilename = req.file.filename;
    try {
        const updatedUser = await uploadService.updateAvatar(req.user.id, avatarFilename);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

