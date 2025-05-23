import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { getUsers, getUserById, removeUser, updateUser } from './user.controller.js'


export const userRoutes = express.Router()


userRoutes.get('/', getUsers)
userRoutes.get('/:id', getUserById)
userRoutes.put('/:id', requireAuth, updateUser)
userRoutes.delete('/:id', requireAuth, requireAdmin, removeUser)
