import * as profileRepository from './profile.repository.js';
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

const updateUser = async (id, data) => {

  if (data.email && !data.email.includes("@")) {
    throw new Error("Invalid email");
  }

  return profileRepository.updateUser(id, data);
};


export { updateProfile, updateUser };