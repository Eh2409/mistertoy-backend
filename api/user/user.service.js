import { ObjectId } from 'mongodb'
import { dbService } from "../../services/db.service.js"
import { loggerService } from '../../services/logger.service.js'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add
}


async function query() {
    try {
        const collection = await dbService.getCollection('user')
        const users = await collection.find({}).toArray()
        const usersToReturn = users.map(user => {
            return ({
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                isAdmin: user.isAdmin
            })
        })
        return usersToReturn
    } catch (err) {
        loggerService.error('Cannot load users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        var user = await collection.findOne({ _id: ObjectId.createFromHexString(userId) })
        user = { ...user }
        delete user.password
        return user
    } catch (err) {
        loggerService.error(`Cannot find user ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        loggerService.error(`Cannot find user ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(userId) })
        return deletedCount
    } catch (err) {
        logger.error(`Cannot remove user ${userId}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const existingUser = await getByUsername(user.username)
        if (existingUser) throw new Error('Username taken')

        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            isAdmin: false,
        }

        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd

    } catch (err) {
        console.error('Failed to add user', err)
        throw err
    }
}
