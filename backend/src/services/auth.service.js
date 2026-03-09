import {findUserByUsername, findUserByEmail, createUser} from '../repositories/auth.repository.js'

async function registerUser(user) {
    if (await findUserByUsername(user.username)) {
        throw new Error('Имя пользователя уже занято');
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