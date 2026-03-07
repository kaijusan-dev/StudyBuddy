import { registerUser, loginUser } from '../services/auth.service.js';

const register = async (req, res) => {
    try {
        const newUser = await registerUser(req.body);
        res.status(201).json({message: 'Пользователь создан', user: newUser});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const login = async (req, res) => {
    try {
        const user = await loginUser(req.body);
        res.status(200).json({message: 'Вход выполнен', user: newUser});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

export { register, login };