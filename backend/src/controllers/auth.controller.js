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
        const token = await generateToken({id: user.id, role: user.role});
        res.status(200).json({user, token});
    } catch(err) {
        res.status(400).json({message: err.message});
    }
}

export { register, login };