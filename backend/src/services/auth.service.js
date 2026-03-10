import {findUserByUsername, findUserByEmail, createUser} from '../repositories/auth.repository.js'
import * as bcrypt from 'bcrypt'

async function registerUser(user) {
    if (await findUserByUsername(user.username)) {
        throw new Error('Имя пользователя уже занято');
    }

    if (await findUserByEmail(user.email)) {
        throw new Error('Email уже занят');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await createUser({...user, password: hashedPassword});

    return newUser;
}

async function loginUser({email, password}) {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('Пользователь не найден');
    }

    const {password: userPassword, ...userData} = user;

    const isValidPassword = await bcrypt.compare(password, userPassword);

    if (!isValidPassword) {
        throw new Error('Неверный пароль');
    }

    return userData;
}

export { registerUser, loginUser };