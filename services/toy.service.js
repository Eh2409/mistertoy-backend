import { utilService } from "./util.service.js"
import fs from 'fs'


export const toyService = {
    query,
    get,
    remove,
    save,
}

const toys = utilService.readJsonFile('data/toy.json')
const PAGE_SIZE = 12

function query(filterBy = {}) {

    return Promise.resolve(toys)
        .then(toys => {


            if (filterBy.name) {
                const regExp = new RegExp(filterBy.name, 'i')
                toys = toys.filter(toy => regExp.test(toy.name))
            }

            if (filterBy.price) {
                toys = toys.filter(toy => toy.price >= filterBy.price)
            }

            if (filterBy.inStock !== undefined) {
                toys = toys.filter(toy => toy.inStock === filterBy.inStock)
            }

            if (filterBy.manufacturer && filterBy.manufacturer.length > 0) {
                toys = toys.filter(toy => filterBy.manufacturer.includes(toy.manufacturer))
            }

            if (filterBy.type && filterBy.type.length > 0) {
                toys = toys.filter(toy => {
                    return toy.type.some(type => filterBy.type.includes(type))
                })
            }

            console.log(filterBy.brand);

            if (filterBy.brand && filterBy.brand.length > 0) {
                toys = toys.filter(toy => filterBy.brand.includes(toy.brand))
            }

            if (filterBy.sortType === 'name') {
                toys = toys.sort((t1, t2) => (t1.name.localeCompare(t2.name)) * filterBy.sortDir)
            }
            if (filterBy.sortType === 'price') {
                toys = toys.sort((t1, t2) => (t1.price - t2.price) * filterBy.sortDir)
            }
            if (filterBy.sortType === 'createdAt') {
                toys = toys.sort((t1, t2) => (t1.createdAt - t2.createdAt) * filterBy.sortDir)
            }

            const maxPageCount = Math.ceil(toys.length / PAGE_SIZE)


            const pageIdx = filterBy.pageIdx ? filterBy.pageIdx : 0
            const startIdx = pageIdx * PAGE_SIZE
            toys = toys.slice(startIdx, startIdx + PAGE_SIZE)


            return { toys, maxPageCount }
        })
}
function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('cannot find toy:' + toyId)
    return Promise.resolve(toy)
}
function remove(toyId) {
    const toyIdx = toys.findIndex(toy => toy._id === toyId)
    if (toyIdx === -1) return Promise.reject('cannot find toy:' + toyId)
    toys.splice(toyIdx, 1)
    return _saveToysToFile().then(() => ({ maxPageCount: _getMaxPageCount() }))
}

function save(toyToSave) {
    if (toyToSave._id) {
        const toyIdx = toys.findIndex(toy => toy._id === toyToSave._id)
        toys[toyIdx] = { ...toys[toyIdx], ...toyToSave }

    } else {
        toyToSave._id = utilService.makeId()
        toyToSave.createdAt = Date.now()
        toyToSave.inStock = true
        toys.unshift(toyToSave)
    }
    return _saveToysToFile().then(() => toyToSave)
}

function _getMaxPageCount() {
    return Math.ceil(toys.length / PAGE_SIZE)
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}