import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { getUsers, getUserById, removeUser } from './user.controller.js'


export const userRoutes = express.Router()


userRoutes.get('/', getUsers)
userRoutes.get('/:id', getUserById)
userRoutes.delete('/:id', requireAuth, requireAdmin, removeUser)
