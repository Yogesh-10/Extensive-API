const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/userModel')

// create token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// create token
	const token = user.getSignedJwtToken()

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true, //cookie to access only in client side script
	}

	if (process.env.NODE_ENV === 'production') {
		options.secure = true //set secure in cookies to true
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	})
}

// @desc      Register user
// @route     POST /api/v1/auth/
// @access    Public
const register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body

	// Create new user
	const user = await User.create({ name, email, password, role })

	// create token
	sendTokenResponse(user, 200, res)
})

// @desc      Register user
// @route     POST /api/v1/auth/login
// @access    Public
const login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body

	// validate email and password
	if (!email || !password) {
		return next(new ErrorResponse('Please provide an email and password', 400))
	}

	// check for user
	const user = await User.findOne({ email }).select('+password')

	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401)) //401 - unauthorised
	}

	// check if password matches
	const isMatched = await user.matchPassword(password)

	if (!isMatched) {
		return next(new ErrorResponse('Invalid credentials', 401))
	}

	// create token
	sendTokenResponse(user, 200, res)
})

module.exports = { register, login }