import { loggerService } from "../../services/logger.service.js"
import { reviewService } from "../review/review.service.js"
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

        const isUserHaveReviews = await reviewService.query({ byUserId: userId })
        if (isUserHaveReviews?.length > 0) {
            return res.status(400).send('Cannot remove user with reviews.')
        }

        await userService.remove(userId)
        res.send('User removed')
    } catch (err) {
        loggerService.error('cannot remove user', err)
        res.status(500).send('cannot remove user')
    }
}

export async function updateUser(req, res) {
    const { loggedinUser, body: user } = req
    console.log('loggedinUser:', loggedinUser)
    console.log('user:', user)


    if (loggedinUser?._id !== user?._id) {
        return res.status(400).send('You are not authorized')
    }

    try {
        const updatedUser = await userService.update(user)
        res.send(updatedUser)
    } catch (err) {
        loggerService.error('cannot update user', err)
        res.status(500).send('cannot update users')
    }
}