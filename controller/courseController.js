const asyncHandler = require('express-async-handler')
const geocoder = require('../utils/geocoder')
const ErrorResponse = require('../utils/errorResponse')
const Course = require('../models/courseModel')

// @desc Get all courses
// @route GET/api/v1/courses
// @access public
const getAllCourses = asyncHandler(async (req, res, next) => {
	const courses = await Course.find({})
	res.status(200).json({
		success: true,
		count: courses.length,
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
	// findByIdAndUpdate first parameter is url, second is what we want to update from body, third is inserting updated new value to DB
	const course = await Course.findByIdAndDelete(req.params.id)
	if (!course) {
		return new ErrorResponse(`Course not found with id of ${req.params.id}`)
	}
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

module.exports = {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseInRadius,
}
