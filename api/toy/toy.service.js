import { ObjectId } from 'mongodb'
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"

export const toyService = {
    query,
    getLabels,
    getChartsData,
    get,
    remove,
    add,
    update,
    saveMsg,
    removeMsg
}

const labels = {
    brands: [
        'Dragon Ball',
        'One Piece',
        'My Hero Academia',
        'Naruto',
        'Marvel',
        'Pokemon',
        'other'
    ],
    types: [
        'Action Figure',
        'S.H.Figuarts',
        'Statue',
        'Building Set',
        'Nanoblock',
        'Keychain',
        'Vinyl Figure',
        'Plush',
        'other'
    ],
    manufacturers: [
        'Kawada',
        'Funko',
        'Banpresto',
        'Iron Studios',
        'Kidrobot',
        'Bandai',
        'Great Eastern Entertainment',
        'Jazwares Inc',
        'Kotobukiya',
        'other'
    ]
}

const PAGE_SIZE = 12

async function query(filterBy = {}) {
    try {
        const { criteria, sort, skip } = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('toy')

        const toys = await collection
            .find(criteria)
            .sort(sort)
            .skip(skip)
            .limit(PAGE_SIZE)
            .toArray()

        // const totalToys = toys.length
        const totalToys = await collection.countDocuments(criteria)
        const maxPageCount = Math.ceil(totalToys / PAGE_SIZE)

        return { toys, maxPageCount }

    } catch (err) {
        loggerService.error('Cannot load toys', err)
        throw err
    }
}


async function get(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        return toy
    } catch (err) {
        loggerService.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    console.log('jaja:')
    try {
        const collection = await dbService.getCollection('toy')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}


async function add(toyToSave) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toyToSave)
        return toyToSave
    } catch (err) {
        loggerService.error('cannot add toy', err)
        throw err
    }
}

async function update(toyToSave, toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $set: toyToSave })
        return toyToSave
    } catch (err) {
        loggerService.error(`cannot update toy ${toyToSave._id}`, err)
        throw err
    }
}

async function _getMaxPageCount() {
    try {
        const totalToys = await collection.countDocuments({})
        const maxPageCount = Math.ceil(totalToys / PAGE_SIZE)
        return maxPageCount
    } catch (err) {
        loggerService.error(`cannot get maxPageCount`, err)
        throw err
    }
}


async function getChartsData() {
    try {
        return {
            byBrands: await _getToysPercentagesByField('brand'),
            byManufacturers: await _getToysPercentagesByField('manufacturer'),
            byTypes: await _getToysPercentagesByField('type'),
            byReleaseYear: await _getToysPercentagesByField('releaseYear')
        }
    } catch (err) {
        loggerService.error('Cannot load chart data', err)
        throw err
    }
}

async function _getToysPercentagesByField(field) {
    try {
        const collection = await dbService.getCollection('toy')
        const toys = await collection.find({}).toArray()

        const countMap = field === 'type' ? countByArryField(field, toys) : countByField(field, toys)
        const PercentagesMap = Object.keys(countMap).map(name =>
        ({
            name,
            items: countMap[name],
            percentage: Math.round((countMap[name] / toys.length) * 100)
        }))

        return PercentagesMap

    } catch (err) {
        loggerService.error('Cannot load charts', err)
        throw err
    }
}


function countByField(field, toys) {
    const countMap = toys.reduce((acc, toy) => {
        const toyField = toy[field]
        if (!acc[toyField]) acc[toyField] = 1
        else acc[toyField] += 1
        return acc
    }, {})
    return countMap
}

function countByArryField(field, toys) {
    const countMap = toys.reduce((acc, toy) => {
        toy[field].map(item => {
            if (!acc[item]) acc[item] = 1
            else acc[item] += 1
            return acc
        })
        return acc
    }, {})
    return countMap
}


async function getLabels() {
    return labels
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.name) {
        criteria.name = { $regex: filterBy.name, $options: 'i' }
    }

    if (filterBy.price !== undefined) {
        criteria.price = { $gte: +filterBy.price }
    }

    if (filterBy.inStock !== undefined) {
        criteria.inStock = filterBy.inStock
    }

    if (filterBy.manufacturer && filterBy.manufacturer.length > 0) {
        criteria.manufacturer = { $in: filterBy.manufacturer }
    }

    if (filterBy.type && filterBy.type.length > 0) {
        criteria.type = { $in: filterBy.type }
    }

    if (filterBy.brand && filterBy.brand.length > 0) {
        criteria.brand = { $in: filterBy.brand }
    }

    const sort = {}
    if (filterBy.sortType) {
        const dir = filterBy.sortDir
        const sortType = filterBy.sortType === 'createdAt' ? '_id' : filterBy.sortType
        sort[sortType] = dir
    } else {
        sort['_id'] = filterBy.sortDir
    }

    const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0
    return { criteria, sort, skip }
}



async function saveMsg(toyId, msgToSave) {
    try {
        msgToSave.id = utilService.makeId()
        msgToSave.createAt = Date.now()

        const collection = await dbService.getCollection('toy')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
            { $push: { msgs: msgToSave } }
        )
        return msgToSave
    } catch (err) {
        loggerService.error('cannot add message to toy', err)
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
            { $pull: { msgs: { id: msgId } } }
        )
        return msgId
    } catch (err) {
        loggerService.error('cannot remove message to toy', err)
        throw err
    }
}