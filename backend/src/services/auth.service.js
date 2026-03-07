import {findUserByNickname, findUserByEmail, createUser} from '../repositories/auth.repository.js'

async function registerUser(user) {
    if (await findUserByNickname(user.nickname)) {
        throw new Error('Никнейм уже занят');
    }

    if (await findUserByEmail(user.email)) {
        throw new Error('Email уже занят');
    }

    const newUser = await createUser(user);

    return newUser;
}

async function loginUser({email, password}) {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('Пользователь не найден');
    }

    if (user.password != password) {
        throw new Error('Неверный пароль');
    }

    return user;
}

export { registerUser, loginUser };