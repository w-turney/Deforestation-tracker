import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config.js'
import apiRouter from './routes/api.js'
import authRouter from './routes/auth.js'
import notFoundMiddleware from './middleware/notFound.js'
import errorHandlerMiddleware from './middleware/error-handler.js'

const requiredEnvVars = ['DATABASE_URL', 'API_KEY', 'JWT_SECRET']
for (const key of requiredEnvVars) {
    if (!process.env[key]) throw new Error(`Missing environment variable: ${key}`)
}

const app = express()

app.use(express.json({ limit: '1mb' }))

app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/api', apiRouter)

app.use(notFoundMiddleware)

app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))