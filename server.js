import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { toyRoutes } from './api/toy/toy.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:3000',
            'http://localhost:3000',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}




app.use('/**', setupAsyncLocalStorage)

app.use('/api/toy', toyRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/review', reviewRoutes)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => console.log(`Server ready at port http://127.0.0.1:${port}`))