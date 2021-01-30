const express = require('express')
const router = express.Router()
const {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseInRadius,
	coursePhotoUpload,
} = require('../controller/courseController')
const courseSpecializationRoutes = require('./courseSpecializationRoutes')
const advancedResultMiddleware = require('../middleware/advancedResultMiddleware')
const Course = require('../models/courseModel')

// Re route in to other resource routers
router.use('/:courseId/course-specialization', courseSpecializationRoutes)

router.route('/radius/:zipcode/:distance').get(getCourseInRadius)

router.route('/:id/photo').put(coursePhotoUpload)

router
	.route('/')
	.get(advancedResultMiddleware(Course, 'coursespecialization'), getAllCourses)
	.post(createCourse)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router
