const Course = require('../models/courseModel')

// @desc Get all courses
// @route GET/api/v1/courses
// @access public
const getAllCourses = async (req, res, next) => {
	try {
		const courses = await Course.find({})
		res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		})
	} catch (error) {
		console.log(error)
	}
}

// @desc Get single course
// @route GET/api/v1/courses/:id
// @access public
const getCourse = async (req, res, next) => {
	try {
		const course = await Course.findById(req.params.id)

		if (!course) {
			return res.status(400).json({ success: false })
		}

		res.status(200).json({
			success: true,
			data: course,
		})
	} catch (error) {
		res.status(400).json({
			success: false,
			error: error,
		})
	}
}

// @desc create courses
// @route PUT/api/v1/courses
// @access private
const createCourse = async (req, res, next) => {
	try {
		const newCourse = await Course.create(req.body)
		res.status(201).json({
			success: true,
			data: newCourse,
		})
	} catch (error) {
		console.log(error)
	}
}

// @desc updte courses
// @route PUT/api/v1/courses/:id
// @access private
const updateCourse = async (req, res, next) => {
	try {
		// findByIdAndUpdate first parameter is url, second is what we want to update from body, third is inserting updated new value to DB
		const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		if (!course) {
			return res.status(400).json({ success: false })
		}
		res.json({
			success: true,
			msg: course,
		})
	} catch (error) {
		console.log(error)
	}
}

// @desc delete courses
// @route PUT/api/v1/courses/:id
// @access private
const deleteCourse = async (req, res, next) => {
	try {
		// findByIdAndUpdate first parameter is url, second is what we want to update from body, third is inserting updated new value to DB
		const course = await Course.findByIdAndDelete(req.params.id)
		if (!course) {
			return res.status(400).json({ success: false })
		}
		res.json({
			success: true,
		})
	} catch (error) {
		console.log(error)
	}
}

module.exports = {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
}
