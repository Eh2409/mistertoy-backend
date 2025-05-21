import express from 'express'
import { getReviews, getReviewById, addReview, removeReview } from './review.controller.js'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'


export const reviewRoutes = express.Router()

reviewRoutes.get('/', getReviews)
reviewRoutes.get('/:id', getReviewById)

reviewRoutes.post('/', requireAuth, addReview)
// reviewRoutes.put('/:id', requireAuth, updateReview)
reviewRoutes.delete('/:id', requireAuth, requireAdmin, removeReview)
