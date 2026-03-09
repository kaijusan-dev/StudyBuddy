import { registerUser, loginUser } from '../services/auth.service.js';

const register = async (req, res) => {
    try {
        const newUser = await registerUser(req.body);
        res.status(201).json(newUser);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

const login = async (req, res) => {
    try {
        const user = await loginUser(req.body);
        res.status(200).json(user);
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

export { register, login };