import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { getToys, getCharts, getLabels, getToyById, addToy, updateToy, removeToy, addMsg, removeMsg } from './toy.controller.js'

export const toyRoutes = express.Router()


toyRoutes.get('/', getToys)
toyRoutes.get('/labels', getLabels)
toyRoutes.get('/charts', getCharts)
toyRoutes.get('/:id', getToyById)

toyRoutes.post('/', requireAuth, requireAdmin, addToy)
toyRoutes.put('/:id', requireAuth, requireAdmin, updateToy)
toyRoutes.delete('/:id', requireAuth, requireAdmin, removeToy)

toyRoutes.post('/:id/msg', requireAuth, addMsg)
toyRoutes.post('/:id/msg/:msgId', requireAuth, requireAdmin, removeMsg)
