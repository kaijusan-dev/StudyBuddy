import jwt from 'jsonwebtoken'

export default function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({message: 'not authorized'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "token expired" });
        }
        res.status(401).json({message: 'invalid token'});
    }
}