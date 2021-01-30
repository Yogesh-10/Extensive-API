const path = require('path')
const asyncHandler = require('express-async-handler')
const geocoder = require('../utils/geocoder')
const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/courseModel')

// @desc Get all courses
// @route GET/api/v1/courses
// @access public
const getAllCourses = asyncHandler(async (req, res, next) => {
	let query

	// create a copy of req.query
	const reqQuery = { ...req.query }

	// Fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit']

	// Loop and removeFields and delete from reqQuery
	removeFields.forEach((param) => delete reqQuery[param])

	// ceate a query string
	let querystr = JSON.stringify(reqQuery)

	// create operators($lte, $gte, etc...)
	querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

	// Finding resource
	query = Course.find(JSON.parse(querystr)).populate('coursespecialization')

	// select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ')
		query = query.select(fields)
	}

	// sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ')
		query = query.sort(sortBy)
	} else {
		query = query.sort('-createdAt') //descending createdAt
	}

	// pagination-limit
	const page = parseInt(req.query.page, 10) || 1
	const limit = parseInt(req.query.limit, 10) || 20
	const startIndex = (page - 1) * limit
	const endIndex = page * limit
	const total = await Course.countDocuments()

	query = query.skip(startIndex).limit(limit)

	// query Execution
	const courses = await query

	// pagination result
	const pagination = {}
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		}
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		}
	}

	res.status(200).json({
		success: true,
		count: courses.length,
		pagination,
		data: courses,
	})
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
	const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})

	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}
	res.json({
		success: true,
		msg: course,
	})
})

// @desc delete courses
// @route PUT/api/v1/courses/:id
// @access private
const deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id)
	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}

	course.remove() //this triggers pre.remove middleware in courseModel
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
