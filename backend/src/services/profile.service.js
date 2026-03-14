import { updateUser } from '../repositories/profile.repository.js';
import * as bcrypt from 'bcrypt'

const updateGeneral = async (id, data) => {

    const user = await updateUser(id, data);

    return user;
};

const updateEmail = async (id, data) => {

    const user = await updateUser(id, data);

    return user;
};

const updatePassword = async (id, data) => {

    data.password = await bcrypt.hash(data.password, 10);

    delete data.passwordAgain;

    const user = await updateUser(id, data);

    return user;
};

const updateProfile = async (id, data) => {
    if (data.password) return updatePassword(id, data);
    if (data.email) return updateEmail(id, data);
    return updateGeneral(id, data);
};

export { updateProfile };