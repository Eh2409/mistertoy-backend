import path from 'path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { loggerService } from './services/logger.service.js'
import { toyService } from './services/toy.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

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



// toy api

app.get('/api/toy', (req, res) => {

    const filterBy = {
        name: req.query.name || '',
        price: +req.query.price || 0,
        manufacturer: req.query.manufacturer || [],
        type: req.query.type || [],
        brand: req.query.brand || [],
        inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
        pageIdx: +req.query.pageIdx || 0,
        sortType: req.query.sortType || '',
        sortDir: +req.query.sortDir || 0,
    }

    toyService.query(filterBy)
        .then(data => res.send(data))
        .catch(err => {
            loggerService.error('cannot load toys', err)
            res.status(500).send('cannot load toys')
        })
})

app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params

    toyService.get(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('cannot load toy', err)
            res.status(500).send('cannot load toy')
        })
})

app.post('/api/toy', (req, res) => {
    const { name, price, imgUrl, manufacturer, type, brand, releaseYear, description } = req.body
    if (!name || price < 0) return res.status(400).send('Missing required fields')


    const toyToSave = {
        name,
        price: +price || 0,
        imgUrl: imgUrl || '',
        manufacturer: manufacturer || '',
        type: type || [],
        brand: brand || '',
        description: description || '',
        releaseYear: releaseYear || 0,
    }

    toyService.save(toyToSave)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('cannot save toy', err)
            res.status(500).send('cannot save toy')
        })
})

app.put('/api/toy/:toyId', (req, res) => {
    const { _id, name, price, imgUrl, manufacturer, type, brand, releaseYear, description, inStock } = req.body
    if (!_id || !name || price < 0) return res.status(400).send('Missing required fields')

    const toyToSave = {
        _id,
        name,
        price: +price || 0,
        imgUrl: imgUrl || '',
        manufacturer: manufacturer || '',
        type: type || [],
        brand: brand || '',
        description: description || '',
        releaseYear: releaseYear || 0,
        inStock: inStock || true
    }

    toyService.save(toyToSave)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('cannot save toy', err)
            res.status(500).send('cannot save toy')
        })
})

app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params

    toyService.remove(toyId)
        .then(data => res.status(200).send(data))
        .catch(err => {
            loggerService.error('cannot remove toy', err)
            res.status(500).send('cannot remove toy')
        })
})


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => console.log(`Server ready at port http://127.0.0.1:${port}`))