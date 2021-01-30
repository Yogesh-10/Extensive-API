const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const CourseSpecialization = require('../models/coursespecializationModel')
const Course = require('../models/courseModel')

// @desc Get all courses specialization
// @route GET/api/v1/course-specialization
// @route GET/api/v1/courses/:courseId/course-specialization
// @access public

const getCoursesSpecialization = asyncHandler(async (req, res, next) => {
	let query

	if (req.params.courseId) {
		query = CourseSpecialization.find({ course: req.params.courseId })
	} else {
		query = CourseSpecialization.find().populate({
			path: 'course',
			select: 'name description',
		})
	}

	const coursespecialization = await query

	res.status(200).json({
		success: true,
		count: coursespecialization.length,
		data: coursespecialization,
	})
})

// @desc Get single course specialization
// @route GET/api/v1/course-specialization/:id
// @access public

const getCourseSpecialization = asyncHandler(async (req, res, next) => {
	const course = await CourseSpecialization.findById(req.params.id).populate({
		path: 'course',
		select: 'name description',
	})

	if (!course) {
		return next(
			new ErrorResponse(`No Course Available with id of ${req.params.id}`),
			404
		)
	}

	res.status(200).json({
		success: true,
		count: course.length,
		data: course,
	})
})

// @desc Add course specialization
// @route POST/api/v1/courses/:courseId/course-specialization
// @access private

const createCourseSpecialization = asyncHandler(async (req, res, next) => {
	req.body.course = req.params.courseId

	const course = await Course.findById(req.params.courseId)

	if (!course) {
		return next(
			new ErrorResponse(
				`No Courses Available with id of ${req.params.courseId}`
			),
			404
		)
	}

	const newCourse = await CourseSpecialization.create(req.body)

	res.status(200).json({
		success: true,
		data: newCourse,
	})
})

// @desc update course-specialization
// @route PUT/api/v1/course-specialization/:id/
// @access private
const updateCourseSpecialization = asyncHandler(async (req, res, next) => {
	let course = await CourseSpecialization.findById(req.params.id)

	if (!course) {
		return next(
			new ErrorResponse(`No Courses Available with id of ${req.params.id}`),
			404
		)
	}

	course = await CourseSpecialization.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		}
	)

	res.status(200).json({
		success: true,
		data: course,
	})
})

// @desc delete course-specialization
// @route DELETE/api/v1/course-specialization/:id
// @access private
const deleteCourseSpecialization = asyncHandler(async (req, res, next) => {
	const course = await CourseSpecialization.findById(req.params.id)

	if (!course) {
		return next(
			new ErrorResponse(`No Courses Available with id of ${req.params.id}`),
			404
		)
	}

	await CourseSpecialization.deleteOne()

	res.status(200).json({
		success: true,
		data: 'deleted',
	})
})

module.exports = {
	getCoursesSpecialization,
	getCourseSpecialization,
	createCourseSpecialization,
	updateCourseSpecialization,
	deleteCourseSpecialization,
}
