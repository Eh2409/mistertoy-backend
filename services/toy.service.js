import { error, log } from "console"
import { utilService } from "./util.service.js"
import { promises as fs } from 'fs'

export const toyService = {
    query,
    get,
    remove,
    save,
    getChartsData,
    getLabels
}

const toys = utilService.readJsonFile('data/toy.json')
const PAGE_SIZE = 12

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

async function query(filterBy = {}) {

    let filteredToys = structuredClone(toys)

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.price) {
        filteredToys = filteredToys.filter(toy => toy.price >= filterBy.price)
    }

    if (filterBy.inStock !== undefined) {
        filteredToys = filteredToys.filter(toy => toy.inStock === filterBy.inStock)
    }

    if (filterBy.manufacturer && filterBy.manufacturer.length > 0) {
        filteredToys = filteredToys.filter(toy => filterBy.manufacturer.includes(toy.manufacturer))
    }

    if (filterBy.type && filterBy.type.length > 0) {
        filteredToys = filteredToys.filter(toy => {
            return toy.type.some(type => filterBy.type.includes(type))
        })
    }

    if (filterBy.brand && filterBy.brand.length > 0) {
        filteredToys = filteredToys.filter(toy => filterBy.brand.includes(toy.brand))
    }

    if (filterBy.sortType === 'name') {
        filteredToys = filteredToys.sort((t1, t2) => (t1.name.localeCompare(t2.name)) * filterBy.sortDir)
    }
    if (filterBy.sortType === 'price') {
        filteredToys = filteredToys.sort((t1, t2) => (t1.price - t2.price) * filterBy.sortDir)
    }
    if (filterBy.sortType === 'createdAt') {
        filteredToys = filteredToys.sort((t1, t2) => (t1.createdAt - t2.createdAt) * filterBy.sortDir)
    }

    const maxPageCount = Math.ceil(filteredToys.length / PAGE_SIZE)

    if (filterBy.pageIdx !== undefined) {
        const pageIdx = filterBy.pageIdx ? filterBy.pageIdx : 0
        const startIdx = pageIdx * PAGE_SIZE
        filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return { toys: filteredToys, maxPageCount }
}

async function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) throw new Error('cannot find toy:' + toyId)
    return toy
}

async function remove(toyId) {
    const toyIdx = toys.findIndex(toy => toy._id === toyId)
    if (toyIdx === -1) throw new Error('cannot find toy:' + toyId)
    toys.splice(toyIdx, 1)
    await _saveToysToFile()
    return { maxPageCount: _getMaxPageCount() }
}

async function save(toyToSave) {
    if (toyToSave._id) {
        const toyIdx = toys.findIndex(toy => toy._id === toyToSave._id)
        toys[toyIdx] = { ...toys[toyIdx], ...toyToSave }

    } else {
        toyToSave._id = utilService.makeId()
        toyToSave.createdAt = Date.now()
        toyToSave.inStock = true
        toys.unshift(toyToSave)
    }

    await _saveToysToFile()
    return toyToSave
}

function _getMaxPageCount() {
    return Math.ceil(toys.length / PAGE_SIZE)
}


async function _saveToysToFile() {
    const data = JSON.stringify(toys, null, 4)
    try {
        await fs.writeFile('data/toy.json', data)
    } catch (err) {
        throw err
    }
}

async function getChartsData() {
    return {
        byBrands: _getToysPercentagesByField('brand'),
        byManufacturers: _getToysPercentagesByField('manufacturer'),
        byTypes: _getToysPercentagesByField('type'),
        byReleaseYear: _getToysPercentagesByField('releaseYear')
    }
}

function _getToysPercentagesByField(field) {
    const countMap = field === 'type' ? countByArryField(field) : countByField(field)
    const PercentagesMap = Object.keys(countMap).map(name =>
    ({
        name,
        items: countMap[name],
        percentage: Math.round((countMap[name] / toys.length) * 100)
    }))
    return PercentagesMap
}


function countByField(field) {
    const countMap = toys.reduce((acc, toy) => {
        const toyField = toy[field]
        if (!acc[toyField]) acc[toyField] = 1
        else acc[toyField] += 1
        return acc
    }, {})
    return countMap
}

function countByArryField(field) {
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