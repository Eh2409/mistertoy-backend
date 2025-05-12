import express from 'express'
// import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
// import { log } from '../../middlewares/logger.middleware.js'
import { getToys, getCharts, getLabels, getToyById, addToy, updateToy, removeToy } from './toy.controller.js'

export const toyRoutes = express.Router()


toyRoutes.get('/', getToys)
toyRoutes.get('/labels', getLabels)
toyRoutes.get('/charts', getCharts)
toyRoutes.get('/:id', getToyById)
toyRoutes.post('/', addToy)
toyRoutes.put('/:id', updateToy)
toyRoutes.delete('/:id', removeToy)
