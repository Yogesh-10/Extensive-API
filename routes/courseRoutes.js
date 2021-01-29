const express = require('express')
const router = express.Router()
const {
	getAllCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} = require('../controller/courseController')

router.route('/').get(getAllCourses).post(createCourse)
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router
