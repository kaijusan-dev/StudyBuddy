import fs from "fs";
import path from "path";
import {findUserById} from '../repositories/auth.repository.js'
import {updateUser} from '../repositories/profile.repository.js'

export const updateAvatar = async (id, avatarUrl) => {

    const user = await findUserById(id);

    // если есть старый аватар
    if (user.avatar) {

        const oldPath = path.join(process.cwd(), user.avatar);

        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const updatedUser = await updateUser(id, {
        avatar: avatarUrl
    });

    return updatedUser;
};