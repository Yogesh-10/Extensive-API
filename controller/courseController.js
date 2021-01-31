const path = require('path')
const asyncHandler = require('express-async-handler')
const geocoder = require('../utils/geocoder')
const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/courseModel')

// @desc Get all courses
// @route GET/api/v1/courses
// @access public
const getAllCourses = asyncHandler(async (req, res, next) => {
	// we are having access to advancedResultMiddleware because that route in courseRoutes is passed with this getAllCourses function
	res.status(200).json(res.advancedResultMiddleware)
})

// @desc Get single course
// @route GET/api/v1/courses/:id
// @access public
const getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id)

	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}

	res.status(200).json({
		success: true,
		data: course,
	})
})

// @desc create courses
// @route PUT/api/v1/courses
// @access private
const createCourse = asyncHandler(async (req, res, next) => {
	// Add user to req.body
	req.body.user = req.user.id

	// check for published bootcamp
	const publishedCourse = await Course.findOne({ user: req.user.id })

	// If user is not admin, can only add one course
	if (publishedCourse && req.user.role != 'admin') {
		return next(
			new ErrorResponse(
				`The user with ${req.user.id} already published a course`,
				400
			)
		)
	}

	const newCourse = await Course.create(req.body)
	res.status(201).json({
		success: true,
		data: newCourse,
	})
})

// @desc updte courses
// @route PUT/api/v1/courses/:id
// @access private
const updateCourse = asyncHandler(async (req, res, next) => {
	// findByIdAndUpdate first parameter is url, second is what we want to update from body, third is inserting updated new value to DB
	let course = await Course.findById(req.params.id)

	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}

	// check if user is course owner
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return new ErrorResponse(
			`User ${req.user.id} not athorized to update course`,
			401
		)
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})

	res.status(200).json({
		success: true,
		data: course,
	})
})

// @desc delete courses
// @route DELETE/api/v1/courses/:id
// @access private
const deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id)
	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}

	// check if user is course owner
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return new ErrorResponse(
			`User ${req.user.id} not athourized to delete course`,
			401
		)
	}

	course.deleteOne() //this triggers pre.remove middleware in courseModel
	res.json({
		success: true,
	})
})

// @desc GET courses within a radius
// @route PUT/api/v1/raduis/:zipcode/:distance
// @access private
const getCourseInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode)
	const lat = loc[0].latitude
	const lng = loc[0].longitude

	// calculate radius using radians
	// divide distance by radius of earth
	// Earth radius = 3963 mi / 6378 km
	const radius = distance / 3963

	const courses = await Course.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	})
	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses,
	})
})

// @desc upload photo
// @route PUT/api/v1/courses/:id/photo
// @access private
const coursePhotoUpload = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id)
	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}

	// check if user is course owner
	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return new ErrorResponse(
			`User ${req.user.id} not athourized to delete course`,
			401
		)
	}

	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file`, 400))
	}

	const file = req.files.file

	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse(`Please upload a image file`, 400))
	}

	// check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload a image less than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		)
	}

	// create custom filename
	file.name = `photo_${course._id}${path.parse(file.name).ext}`

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(error)
			return next(new ErrorResponse(`problem with file upload`, 500))
		}

		await Course.findByIdAndUpdate(req.params.id, { photo: file.name })
	})

	res.json({
		success: true,
		data: file.name,
	})
})

module.exports = {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseInRadius,
	coursePhotoUpload,
}
