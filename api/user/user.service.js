import { ObjectId } from 'mongodb'
import { dbService } from "../../services/db.service.js"
import { loggerService } from '../../services/logger.service.js'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    add,
    update
}


async function query() {
    try {
        const collection = await dbService.getCollection('user')
        const users = await collection.find({}).toArray()
        const nonAdminUsers = users.filter(user => !user?.isAdmin);
        const usersToReturn = nonAdminUsers.map(user => {
            return ({
                _id: user._id,
                username: user.username,
                fullname: user.fullname,
                profileImg: user.profileImg
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
            profileImg: user.profileImg
        }

        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd

    } catch (err) {
        console.error('Failed to add user', err)
        throw err
    }
}


async function update(user) {

    const { profileImg } = user

    const userToSave = {
        profileImg
    }

    try {
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: ObjectId.createFromHexString(user._id) }, { $set: userToSave })
        return user
    } catch (err) {
        loggerService.error(`cannot update user ${user._id}`, err)
        throw err
    }
}