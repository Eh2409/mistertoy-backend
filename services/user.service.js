import { promises as fs } from 'fs'
import { utilService } from './util.service.js'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add
}

const users = utilService.readJsonFile('data/user.json')

async function query() {
    return users
}

async function getById(userId) {
    var user = users.find(user => user._id === userId)
    if (!user) throw new Error('cannot find user - ' + userId)
    user = { ...user }
    delete user.password
    return user
}

async function getByUsername(username) {
    const user = users.find(user => user.username === username)
    return user
}

async function remove(userId) {
    var useridx = users.findIndex(user => user._id === userId)
    if (useridx === -1) throw new Error('cannot remove user - ' + userId)
    users.splice(useridx, 1)
    return await _saveUsersToFile()
}

async function add(user) {
    const { username, password, fullname } = user
    if (!username || !password || !fullname) {
        throw new Error('Missing required fields')
    }

    try {
        const existingUser = await getByUsername(username)
        if (existingUser) throw new Error('Username taken')

        user._id = utilService.makeId()
        user.isAdmin = false

        users.unshift(user)
        await _saveUsersToFile()

        user = { ...user }
        delete user.password
        return user
    } catch (err) {
        console.error('Failed to add user:', err)
        throw err
    }
}

async function _saveUsersToFile() {
    const data = JSON.stringify(users, null, 4)
    try {
        await fs.writeFile('data/user.json', data)
    } catch (err) {
        throw err
    }
}