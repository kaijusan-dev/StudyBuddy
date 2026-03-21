import fs from "fs";
import path from "path";
import { findUserById } from '../repositories/auth.repository.js';
import { updateUser } from '../repositories/profile.repository.js';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, '../uploads/avatars');

export const updateAvatar = async (id, avatarFilename) => {
  const user = await findUserById(id);

  if (user.avatar) {
    
    const oldPath = path.join(uploadPath, user.avatar);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const updatedUser = await updateUser(id, {
    avatar: avatarFilename
  });

  return updatedUser;
};