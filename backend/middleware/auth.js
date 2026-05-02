import jwt from 'jsonwebtoken'
import UnauthenticatedError from '../errors/unauthenticated.js'
import { findUserById } from '../repositories/user-repository.js'

const COOKIE_NAME = 'df_cookie'
const isProd = process.env.NODE_ENV === 'production'
const clearCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/'
}

const authMiddleware = async (req, res, next) => {
    const token = req.cookies[COOKIE_NAME]
    if (!token) throw new UnauthenticatedError('No session cookie provided')
    let payload
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        res.clearCookie(COOKIE_NAME, clearCookieOptions)
        throw new UnauthenticatedError('Invalid session cookie')
    }
    const user = await findUserById(payload.uid)
    if (!user) {
        res.clearCookie(COOKIE_NAME, clearCookieOptions)
        throw new UnauthenticatedError('Session user no longer exists')
    }
    req.user = user
    req.userId = user.id
    next()
}

export default authMiddleware