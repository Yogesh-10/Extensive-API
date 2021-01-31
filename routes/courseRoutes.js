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
const reviewRoutes = require('./reviewRoutes')
const advancedResultMiddleware = require('../middleware/advancedResultMiddleware')
const Course = require('../models/courseModel')
const { protect, authorize } = require('../middleware/authMiddleware')

// Re route in to other resource routers
router.use('/:courseId/course-specialization', courseSpecializationRoutes)
router.use('/:courseId/reviews', reviewRoutes)

router.route('/radius/:zipcode/:distance').get(getCourseInRadius)

router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), coursePhotoUpload)

router
	.route('/')
	.get(advancedResultMiddleware(Course, 'coursespecialization'), getAllCourses)
	.post(protect, authorize('publisher', 'admin'), createCourse)

router
	.route('/:id')
	.get(getCourse)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router
