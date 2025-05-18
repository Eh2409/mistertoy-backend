import { loggerService } from "../../services/logger.service.js"
import { toyService } from "./toy.service.js"


export async function getToys(req, res) {

    const filterBy = {
        name: req.query?.name || '',
        price: +req.query?.price || 0,
        manufacturer: req.query?.manufacturer || [],
        type: req.query?.type || [],
        brand: req.query?.brand || [],
        inStock: req.query?.inStock === 'true' ? true : req.query?.inStock === 'false' ? false : undefined,
        pageIdx: +req.query?.pageIdx || 0,
        sortType: req.query?.sortType || '',
        sortDir: +req.query?.sortDir || -1,
    }

    try {
        const data = await toyService.query(filterBy)
        res.send(data)
    } catch (err) {
        loggerService.error('cannot load toys', err)
        res.status(500).send('cannot load toys')
    }
}

export async function getCharts(req, res) {
    try {
        const data = await toyService.getChartsData()
        res.send(data)
    } catch (err) {
        loggerService.error('cannot load charts data', err)
        res.status(500).send('cannot load charts data')
    }
}

export async function getLabels(req, res) {
    try {
        const labels = await toyService.getLabels()
        res.send(labels)
    } catch (err) {
        loggerService.error('cannot load labels data', err)
        res.status(500).send('cannot load labels data')
    }
}


export async function getToyById(req, res) {

    try {
        const toyId = req.params.id
        const toy = await toyService.get(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('cannot load toy', err)
        res.status(500).send('cannot load toy')
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req

    const { name, price, imgUrl, manufacturer, type, brand, releaseYear, description, inStock, msgs, imgUrls } = req.body
    if (!name || price < 0 || !brand, !loggedinUser) return res.status(400).send('Missing required fields')


    const toyToSave = {
        name: name || '',
        price: +price || 0,
        imgUrl: imgUrl || '',
        manufacturer: manufacturer || '',
        type: type || [],
        brand: brand || '',
        description: description || '',
        releaseYear: releaseYear || 0,
        inStock: inStock || true,
        owner: loggedinUser,
        msgs: msgs || [],
        imgUrls: imgUrls || []
    }

    try {
        const toy = await toyService.add(toyToSave)
        res.send(toy)
    } catch (err) {
        loggerService.error('cannot save toy', err)
        res.status(500).send('cannot save toy')
    }
}


export async function updateToy(req, res) {
    const { _id, name, price, imgUrl, manufacturer, type, brand, releaseYear, description, inStock, owner, imgUrls } = req.body
    if (!_id || !name || price < 0 || !brand) return res.status(400).send('Missing required fields')

    const toyToSave = {
        name,
        price: +price || 0,
        imgUrl: imgUrl || '',
        manufacturer: manufacturer || '',
        type: type || [],
        brand: brand || '',
        description: description || '',
        releaseYear: releaseYear || 0,
        inStock: inStock || true,
        owner,
        imgUrls: imgUrls || []
    }

    const toyId = req.params.id

    try {
        const toy = await toyService.update(toyToSave, toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('cannot save toy', err)
        res.status(500).send('cannot save toy')
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        loggerService.error('cannot remove toy', err)
        res.status(500).send('cannot remove toy')
    }
}



export async function addMsg(req, res) {
    const { loggedinUser } = req
    const { txt } = req.body
    if (!txt) return res.status(400).send('Missing required fields')

    try {
        const { _id, fullname } = loggedinUser

        const msgToSave = {
            txt,
            by: { _id, fullname }
        }
        const toyId = req.params.id

        const savedMsg = await toyService.saveMsg(toyId, msgToSave)
        res.send(savedMsg)
    } catch (err) {
        loggerService.error('cannot save message', err)
        res.status(500).send('cannot save message')
    }
}

export async function removeMsg(req, res) {
    try {
        const { msgId } = req.params
        if (!msgId) return res.status(400).send('Missing required fields')

        const toyId = req.params.id

        const removedMsg = await toyService.removeMsg(toyId, msgId)
        res.send(removedMsg)
    } catch (err) {
        loggerService.error('cannot remove message', err)
        res.status(500).send('cannot remove message')
    }
}
