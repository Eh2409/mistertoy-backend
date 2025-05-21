import { loggerService } from "../../services/logger.service.js"
import { reviewService } from "./review.service.js"
import { toyService } from "../toy/toy.service.js"


export async function getReviews(req, res) {
    const filterBy = req.query
    try {
        const data = await reviewService.query(filterBy)
        res.send(data)
    } catch (err) {
        loggerService.error('cannot load reviews', err)
        res.status(500).send('cannot load reviews')
    }
}


export async function getReviewById(req, res) {
    try {
        const reviewId = req.params.id
        const review = await reviewService.get(reviewId)
        res.send(review)
    } catch (err) {
        loggerService.error('cannot load review', err)
        res.status(500).send('cannot load review')
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req

    const review = req.body
    const { txt, aboutToyId } = review
    if (!txt || !aboutToyId || !loggedinUser?._id) return res.status(400).send('Missing required fields')

    review.byUserId = loggedinUser._id

    try {
        const savedReview = await reviewService.add(review)

        savedReview.byUser = loggedinUser
        savedReview.aboutToy = await toyService.get(aboutToyId)

        delete savedReview.aboutToyId
        delete savedReview.byUserId

        res.send(savedReview)
    } catch (err) {
        loggerService.error('cannot save review', err)
        res.status(500).send('cannot save review')
    }
}


export async function updateReview(req, res) {
    const { body: review } = req
    const { txt, aboutToyId, byUserId } = review

    if (!txt || !aboutToyId || !byUserId) return res.status(400).send('Missing required fields')

    try {
        const updatedReview = await reviewService.update(review)
        res.send(updatedReview)
    } catch (err) {
        loggerService.error('cannot save review', err)
        res.status(500).send('cannot save review')
    }
}

export async function removeReview(req, res) {
    try {
        const reviewId = req.params.id
        const deletedCount = await reviewService.remove(reviewId)
        res.send(`${deletedCount} reviews removed`)
    } catch (err) {
        loggerService.error('cannot remove review', err)
        res.status(500).send('cannot remove review')
    }
}




