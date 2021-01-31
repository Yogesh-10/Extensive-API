const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/userModel')

// *** This controller is only for admin CRUD functions ****//

// @desc      Get all users
// @route     POST /api/v1/auth/users
// @access    Private/ admin
const getAllUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResultMiddleware)
})

// @desc      Get all users
// @route     POST /api/v1/auth/users/:id
// @access    Private/ admin
const getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id)

	res.status(200).json({
		success: true,
		data: user,
	})
})

// @desc      Create user
// @route     POST /api/v1/auth/users
// @access    Private/ admin
const createUser = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body)

	res.status(201).json({
		success: true,
		data: user,
	})
})

// @desc      Get all users
// @route     PUT /api/v1/auth/users/:id
// @access    Private/ admin
const updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	})

	res.status(200).json({
		success: true,
		data: user,
	})
})

// @desc      delete user
// @route     DELETE /api/v1/auth/users
// @access    Private/ admin
const deleteUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id)

	res.status(200).json({
		success: 'deleted',
	})
})

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser }
