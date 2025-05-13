import { loggerService } from "../../services/logger.service.js"
import { userService } from "./user.service.js"


export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        loggerService.error('cannot load users', err)
        res.status(500).send('cannot load users')
    }
}

export async function getUserById(req, res) {
    try {
        const userId = req.params.id
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error('cannot load user', err)
        res.status(500).send('cannot load user')
    }
}

export async function removeUser(req, res) {
    try {
        const userId = req.params.id
        await userService.remove(userId)
        res.send('User removed')
    } catch (err) {
        loggerService.error('cannot remove user', err)
        res.status(500).send('cannot remove user')
    }
}