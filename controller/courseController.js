const asyncHandler = require('express-async-handler')
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
		return ErrorResponse(`Course not found with id of ${req.params.id}`)
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
		return ErrorResponse(`Course not found with id of ${req.params.id}`)
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
		return ErrorResponse(`Course not found with id of ${req.params.id}`)
	}
	res.json({
		success: true,
	})
})

module.exports = {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
}
