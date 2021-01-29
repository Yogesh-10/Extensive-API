const express = require('express')
const router = express.Router()
const {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseInRadius,
} = require('../controller/courseController')

router.route('/radius/:zipcode/:distance').get(getCourseInRadius)
router.route('/').get(getAllCourses).post(createCourse)
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router
