const express = require('express')
const {
	getCoursesSpecialization,
	getCourseSpecialization,
	createCourseSpecialization,
	updateCourseSpecialization,
	deleteCourseSpecialization,
} = require('../controller/courseSpecializationController')
const Coursespecialization = require('../models/coursespecializationModel')
const advancedResultMiddleware = require('../middleware/advancedResultMiddleware')
const { protect, authorize } = require('../middleware/authMiddleware')

const router = express.Router({ mergeParams: true })

router
	.route('/')
	.get(
		advancedResultMiddleware(Coursespecialization, {
			path: 'course',
			select: 'name description',
		}),
		getCoursesSpecialization
	)
	.post(protect, authorize('publisher', 'admin'), createCourseSpecialization)

router
	.route('/:id')
	.get(getCourseSpecialization)
	.put(protect, authorize('publisher', 'admin'), updateCourseSpecialization)
	.delete(protect, authorize('publisher', 'admin'), deleteCourseSpecialization)

module.exports = router
