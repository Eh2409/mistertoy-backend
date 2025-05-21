import { ObjectId } from 'mongodb'
import { dbService } from "../../services/db.service.js"
import { loggerService } from "../../services/logger.service.js"

export const reviewService = {
    query,
    get,
    remove,
    add,
    update,
}


async function query(filterBy = {}) {
    try {
        const { criteria, sort } = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('review')

        var reviews = await collection.aggregate([
            {
                $match: criteria,
            },
            {
                $lookup: {
                    localField: 'byUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser',
                },
            },
            {
                $unwind: '$byUser',
            },
            {
                $lookup: {
                    localField: 'aboutToyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'aboutToy',
                },
            },
            {
                $unwind: '$aboutToy',
            },
            {
                $project: {
                    'txt': true,
                    'byUser._id': true,
                    'byUser.fullname': true,
                    'aboutToy._id': true,
                    'aboutToy.name': true,
                }
            }
        ]).sort(sort).toArray()

        return reviews

    } catch (err) {
        loggerService.error('Cannot load reviews', err)
        throw err
    }
}


async function get(reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        const review = await collection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
        return review
    } catch (err) {
        loggerService.error(`while finding review ${reviewId}`, err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(reviewId) })
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {

    const reviewToSave = {
        byUserId: ObjectId.createFromHexString(review.byUserId),
        aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
        txt: review.txt
    }

    try {
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToSave)
        return reviewToSave
    } catch (err) {
        loggerService.error('cannot add review', err)
        throw err
    }
}

async function update(review) {
    const { txt, aboutToyId, byUserId } = review

    const reviewToSave = {
        txt,
        aboutToyId,
        byUserId
    }

    try {
        const collection = await dbService.getCollection('review')
        await collection.updateOne({ _id: ObjectId.createFromHexString(review._id) }, { $set: reviewToSave })
        return review
    } catch (err) {
        loggerService.error(`cannot update review ${review._id}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.byUserId) {
        criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }

    if (filterBy.aboutToyId) {
        criteria.aboutToyId = ObjectId.createFromHexString(filterBy.aboutToyId)
    }

    const sort = { _id: -1 }
    return { criteria, sort }
}