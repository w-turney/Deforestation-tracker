import express from 'express'
import jwt from 'jsonwebtoken'
import { findUserById, addUser } from '../repositories/user-repository.js'

const router = express.Router()

const COOKIE_NAME = 'df_cookie'
const isProd = process.env.NODE_ENV === 'production'
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30
const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: THIRTY_DAYS_MS,
    path: '/'
}
const clearCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/'
}

router.post('/session', async (req, res) => {
    const token = req.cookies[COOKIE_NAME]
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            const user = await findUserById(payload.uid)
            if (user) {
                const refreshedToken = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })
                res.cookie(COOKIE_NAME, refreshedToken, cookieOptions)
                return res.status(200).json({
                    ok: true,
                    user,
                    isNewSession: false
                })
            }
            res.clearCookie(COOKIE_NAME, clearCookieOptions)
        } catch (err) {
            res.clearCookie(COOKIE_NAME, clearCookieOptions)
        }
    }

    const user = await addUser()
    const newToken = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

    res.cookie(COOKIE_NAME, newToken, cookieOptions)

    return res.status(201).json({
        ok: true,
        user,
        isNewSession: true
    })
})

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, clearCookieOptions)
    return res.status(200).json({ ok: true })
})

export default router