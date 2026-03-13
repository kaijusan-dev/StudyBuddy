import jwt from 'jsonwebtoken'

export default function generateToken(user) {
    return jwt.sign(
        {id: user.id},
        process.env.JWT_SECRET,
        {expiresIn:'1h'}
    )
}