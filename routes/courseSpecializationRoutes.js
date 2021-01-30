const express = require('express')
const {
	getCoursesSpecialization,
	getCourseSpecialization,
	createCourseSpecialization,
	updateCourseSpecialization,
	deleteCourseSpecialization,
} = require('../controller/courseSpecializationController')

const router = express.Router({ mergeParams: true })

router.route('/').get(getCoursesSpecialization).post(createCourseSpecialization)

router
	.route('/:id')
	.get(getCourseSpecialization)
	.put(updateCourseSpecialization)
	.delete(deleteCourseSpecialization)
module.exports = router
