import {findUserByUsername, findUserByEmail, createUser} from './auth.repository.js'
import * as bcrypt from 'bcrypt'

async function registerUser(user) {

    if (await findUserByUsername(user.username)) {
        throw new Error('Имя пользователя уже занято');
    }

    if (await findUserByEmail(user.email)) {
        throw new Error('Email уже занят');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newUser = await createUser({
        ...user,
        password: hashedPassword
    });

    const { password, ...userData } = newUser;

    return userData;
}

async function loginUser({identifier, password}) {

    let user;
    if (identifier.includes("@")) {
        user = await findUserByEmail(identifier);
    } else {
        user = await findUserByUsername(identifier);
    }

    if (!user) {
        throw new Error('Пользователь не найден');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new Error('Неверный пароль');
    }

    const {password: userPassword, ...userData} = user;

    return userData;
}

export { registerUser, loginUser };