import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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




import { toyRoutes } from './api/toy/toy.routes.js'

// routes

app.use('/api/toy', toyRoutes)




// // toy api

// app.get('/api/toy', async (req, res) => {

//     const filterBy = {
//         name: req.query.name || '',
//         price: +req.query.price || 0,
//         manufacturer: req.query.manufacturer || [],
//         type: req.query.type || [],
//         brand: req.query.brand || [],
//         inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
//         pageIdx: +req.query.pageIdx || 0,
//         sortType: req.query.sortType || '',
//         sortDir: +req.query.sortDir || 0,
//     }

//     try {
//         const data = await toyService.query(filterBy)
//         res.send(data)
//     } catch (err) {
//         loggerService.error('cannot load toys', err)
//         res.status(500).send('cannot load toys')
//     }
// })

// app.get('/api/toy/charts', async (req, res) => {
//     try {
//         const data = await toyService.getChartsData()
//         res.send(data)
//     } catch (err) {
//         loggerService.error('cannot load charts data', err)
//         res.status(500).send('cannot load charts data')
//     }
// })

// app.get('/api/toy/labels', async (req, res) => {
//     try {
//         const labels = await toyService.getLabels()
//         res.send(labels)
//     } catch (err) {
//         loggerService.error('cannot load labels data', err)
//         res.status(500).send('cannot load labels data')
//     }
// })


// app.get('/api/toy/:toyId', async (req, res) => {
//     const { toyId } = req.params

//     try {
//         const toy = await toyService.get(toyId)
//         res.send(toy)
//     } catch (err) {
//         loggerService.error('cannot load toy', err)
//         res.status(500).send('cannot load toy')
//     }
// })

// app.post('/api/toy', async (req, res) => {
//     const { name, price, imgUrl, manufacturer, type, brand, releaseYear, description } = req.body
//     if (!name || price < 0) return res.status(400).send('Missing required fields')


//     const toyToSave = {
//         name,
//         price: +price || 0,
//         imgUrl: imgUrl || '',
//         manufacturer: manufacturer || '',
//         type: type || [],
//         brand: brand || '',
//         description: description || '',
//         releaseYear: releaseYear || 0,
//     }

//     try {
//         const toy = await toyService.save(toyToSave)
//         res.send(toy)
//     } catch (err) {
//         loggerService.error('cannot save toy', err)
//         res.status(500).send('cannot save toy')
//     }
// })

// app.put('/api/toy/:toyId', async (req, res) => {
//     const { _id, name, price, imgUrl, manufacturer, type, brand, releaseYear, description, inStock } = req.body
//     if (!_id || !name || price < 0) return res.status(400).send('Missing required fields')

//     const toyToSave = {
//         _id,
//         name,
//         price: +price || 0,
//         imgUrl: imgUrl || '',
//         manufacturer: manufacturer || '',
//         type: type || [],
//         brand: brand || '',
//         description: description || '',
//         releaseYear: releaseYear || 0,
//         inStock: inStock || true
//     }

//     try {
//         const toy = await toyService.save(toyToSave)
//         res.send(toy)
//     } catch (err) {
//         loggerService.error('cannot save toy', err)
//         res.status(500).send('cannot save toy')
//     }
// })

// app.delete('/api/toy/:toyId', async (req, res) => {
//     const { toyId } = req.params

//     try {
//         const data = await toyService.remove(toyId)
//         res.send(data)
//     } catch (err) {
//         loggerService.error('cannot remove toy', err)
//         res.status(500).send('cannot remove toy')
//     }
// })

// user

app.get('/api/user', async (req, res) => {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        loggerService.error('cannot load users', err)
        res.status(500).send('cannot load users')
    }
})

app.get('/api/user/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error('cannot load user', err)
        res.status(500).send('cannot load user')
    }
})

app.delete('/api/user/:userId', async (req, res) => {
    const { userId } = req.params

    try {
        await userService.remove(userId)
        res.send('User removed')
    } catch (err) {
        loggerService.error('cannot remove user', err)
        res.status(500).send('cannot remove user')
    }
})

// auth

app.post('/api/auth/login', async (req, res) => {
    const credentials = req.body

    try {
        const user = await authService.checkLogin(credentials)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
    } catch (err) {
        loggerService.error('Invalid credentials', err)
        res.status(400).send('Invalid credentials')
    }
})

app.post('/api/auth/signup', async (req, res) => {
    const credentials = req.body

    try {
        const user = await userService.add(credentials)
        if (user) {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        } else {
            res.status(400).send('Cannot singup')
        }
    } catch (err) {
        loggerService.error('Invalid credentials', err)
        res.status(400).send('Invalid credentials')
    }
})

app.post('/api/auth/logout', (req, res) => {
    try {
        res.clearCookie('loginToken')
        res.send('logged-out')
    } catch (err) {
        console.error('Logout error:', err)
        res.status(500).send('Logout failed')
    }
})


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => console.log(`Server ready at port http://127.0.0.1:${port}`))