const express = require('express')
const {
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require('../controller/userController')

const User = require('../models/userModel')
const advancedResultMiddleware = require('../middleware/advancedResultMiddleware')
const { protect, authorize } = require('../middleware/authMiddleware')

const router = express.Router({ mergeParams: true })

router.use(protect) //everthing below this is protected
router.use(authorize('admin')) //everthing below this is authorised

router
	.route('/')
	.get(advancedResultMiddleware(User), getAllUsers)
	.post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
