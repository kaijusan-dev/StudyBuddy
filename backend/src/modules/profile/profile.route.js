import express from 'express'
import { validate } from '#app';
import { emailSettingsSchema, generalSettingsSchema, passwordSettingsSchema } from './profile.schemas.js';
import { findUserById } from '#auth';
import * as profileController from './profile.controller.js';
import multer from "multer";
import path from "path";
import { updateAvatarController } from '#infra';
import fs from "fs";
import { fileURLToPath } from "url";

export const profileRouter = express.Router();

profileRouter.get('/', async (req, res) => {
    const user = await findUserById(req.user.id);
    const {password, ...userData} = user;
    res.json(userData);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, '../../uploads/avatars');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = crypto.randomUUID() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  }
});

profileRouter.post('/avatar', upload.single("avatar"), updateAvatarController);
profileRouter.post('/telegram', profileController.updateTelegramId);

profileRouter.patch('/general', validate(generalSettingsSchema), profileController.updateProfile);
profileRouter.patch('/email', validate(emailSettingsSchema), profileController.updateProfile);
profileRouter.patch('/password', validate(passwordSettingsSchema), profileController.updateProfile);
