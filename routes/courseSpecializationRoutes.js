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
	.post(createCourseSpecialization)

router
	.route('/:id')
	.get(getCourseSpecialization)
	.put(updateCourseSpecialization)
	.delete(deleteCourseSpecialization)
module.exports = router
