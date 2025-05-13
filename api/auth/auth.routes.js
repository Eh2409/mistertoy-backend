import express from 'express'
// import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
// import { log } from '../../middlewares/logger.middleware.js'
import { login, signup, logout } from './ahth.controllers.js'


export const authRoutes = express.Router()


authRoutes.post('/login', login)
authRoutes.post('/signup', signup)
authRoutes.post('/logout', logout)
