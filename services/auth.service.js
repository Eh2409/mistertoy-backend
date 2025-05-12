import Cryptr from 'cryptr'
import { userService } from "./user.service.js";

const crypter = new Cryptr(process.env.SECRET1 || 'secret-toy-user-1020')

export const authService = {
    checkLogin,
    getLoginToken,
    validateToken,
}

async function checkLogin({ username, password }) {
    try {
        var user = await userService.getByUsername(username)
        if (user && user.password === password) {
            user = { ...user }
            delete user.password
            return user
        } else {
            throw new Error('Invalid login')
        }
    } catch (err) {
        console.error('Login error:', err)
        throw new Error('Login failed')
    }
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = crypter.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    if (!token) return null

    const str = crypter.decrypt(token)
    const user = JSON.parse(str)
    return user
}

