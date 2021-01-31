const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const Review = require('../models/reviewModel')
const Course = require('../models/courseModel')

// @desc Get all reviews
// @route GET/api/v1/reviews
// @route GET/api/v1/courses/:courseId/reviews
// @access public
const getAllReviews = asyncHandler(async (req, res, next) => {
	if (req.params.courseId) {
		const reviews = await Review.find({
			course: req.params.courseId,
		})

		res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		})
	} else {
		res.status(200).json(res.advancedResultMiddleware)
	}
})

// @desc Get single review
// @route GET/api/v1/reviews/:id
// @access public
const getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: 'course',
		select: 'name description',
	})

	if (!review) {
		return next(new ErrorResponse(`No Review with id of ${req.params.id}`, 404))
	}

	res.status(200).json({
		success: true,
		data: review,
	})
})

// @desc Add Review
// @route POST/api/v1/courses/:courseId/reviews
// @access Private
const addReview = asyncHandler(async (req, res, next) => {
	req.body.course = req.params.courseId
	req.body.user = req.user.id

	const course = await Course.findById(req.params.courseId)

	if (!course) {
		return next(
			new ErrorResponse(`No course with id of ${req.params.courseId}`, 404)
		)
	}

	const review = await Review.create(req.body) //will have all data in body including course and user as assigned in first line

	res.status(201).json({
		success: true,
		data: review,
	})
})

// @desc Update Review
// @route PUT/api/v1/reviews/:id
// @access Private
const updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id)

	if (!review) {
		return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404))
	}

	// check if review belong to user or user is admin
	if (review.user.toString() !== req.user.id && req.user.role) {
		return next(new ErrorResponse(`Not authorized to update review`, 401))
	}
	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})

	res.status(200).json({
		success: true,
		data: review,
	})
})

// @desc Delete Review
// @route DELETE/api/v1/reviews/:id
// @access Private
const deleteReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id)

	if (!review) {
		return next(new ErrorResponse(`No review with id of ${req.params.id}`, 404))
	}

	// check if review belong to user or user is admin
	if (review.user.toString() !== req.user.id && req.user.role) {
		return next(new ErrorResponse(`Not authorized to update review`, 401))
	}

	await Review.deleteOne()

	res.status(200).json({
		data: 'deleted',
	})
})

module.exports = {
	getAllReviews,
	getReview,
	addReview,
	updateReview,
	deleteReview,
}
