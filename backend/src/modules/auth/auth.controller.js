import { registerUser, loginUser } from '../services/auth.service.js';
import generateToken from '../services/token.service.js';

const register = async (req, res) => {
    try {
        await registerUser(req.body);
        res.status(201).json({message: 'user created'});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const login = async (req, res) => {
    try {
        const user = await loginUser(req.body);
        const token = await generateToken({id: user.id});
        res.status(200).json({user, token});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

// Новая функция для авторизации по Telegram ID
const loginByTg = async (req, res) => {
    try {
        const { telegram_id } = req.body;
        if (!telegram_id) {
            return res.status(400).json({ message: 'Missing telegram_id' });
        }
        // Временная заглушка – возвращаем тестового пользователя
        const user = { id: 1, telegram_id, username: 'test' };
        const token = await generateToken({ id: user.id });
        res.status(200).json({ token, user });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

export { register, login, loginByTg };
