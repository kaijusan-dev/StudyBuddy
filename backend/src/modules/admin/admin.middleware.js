export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && process.env.MODE !== 'development') {
        return res.status(403).json({ message: 'Not enough permissions' });
    }
    next();
}
