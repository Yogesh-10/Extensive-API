const express = require('express')
const {
	getAllReviews,
	getReview,
	addReview,
	updateReview,
	deleteReview,
} = require('../controller/reviewController')
const Review = require('../models/reviewModel')
const advancedResultMiddleware = require('../middleware/advancedResultMiddleware')
const { protect, authorize } = require('../middleware/authMiddleware')

const router = express.Router({ mergeParams: true })

router
	.route('/')
	.get(
		advancedResultMiddleware(Review, {
			path: 'course',
			select: 'name description',
		}),
		getAllReviews
	)
	.post(protect, authorize('user', 'admin'), addReview)

router
	.route('/:id')
	.get(getReview)
	.put(protect, authorize('user', 'admin'), updateReview)
	.delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router
