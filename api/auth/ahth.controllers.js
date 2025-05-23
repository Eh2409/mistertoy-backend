import { loggerService } from "../../services/logger.service.js"
import { authService } from "./auth.service.js"


export async function login(req, res) {
    const { username, password } = req.body
    try {
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
    } catch (err) {
        loggerService.error('Invalid credentials', err)
        res.status(400).send('Invalid credentials')
    }
}

export async function signup(req, res) {
    try {
        const { username, password, fullname, profileImg } = req.body
        const account = await authService.signup(username, password, fullname, profileImg)

        if (account) {
            const user = await authService.login(username, password)
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        } else {
            res.status(400).send('Cannot singup')
        }
    } catch (err) {
        loggerService.error('Invalid credentials', err)
        res.status(400).send('Invalid credentials')
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send('logged-out')
    } catch (err) {
        console.error('Logout error:', err)
        res.status(500).send('Logout failed')
    }
}