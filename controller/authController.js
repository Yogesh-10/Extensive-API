const crypto = require('crypto')
const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
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

// @desc      Log out user and removie cookie
// @route     GET /api/v1/auth/logout
// @access    Private
const logout = asyncHandler(async (req, res, next) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 100), //10 seconds
		httpOnly: true,
	})
})

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
const getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id)
	res.status(200).json({ success: true, data: user })
})

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Private
const forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email })

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404))
	}
	// get reset token
	const resetToken = user.getResetPasswordToken()

	await user.save({ validateBeforeSave: false })

	// create reset URL
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`

	const message = `You are recieving this email because you have requested for reset of password. use the link below to reset your password: \n\n ${resetUrl}`

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset Link',
			message,
		})
		res.status(200).json({ success: true, data: 'Email sent' })
	} catch (error) {
		console.log(error)
		user.getResetPasswordToken = undefined
		user.resetPasswordToken = undefined

		await user.save({ validateBeforeSave: false })
		return next(new ErrorResponse('Email could not be sent', 500))
	}
})

// @desc      reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
const resetPassword = asyncHandler(async (req, res, next) => {
	// Get Hashed Token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex')

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	})

	if (!user) {
		return next(new ErrorResponse('Invalid token', 400))
	}

	// set password
	user.password = req.body.password
	// after resetting make undefined so that these below two fields is not saved in DB
	user.resetPasswordToken = undefined
	user.resetPasswordExpire = undefined

	await user.save()

	sendTokenResponse(user, 200, res)
})

// @desc      update user details
// @route     PUT/ api/v1/auth/updatedetails
// @access    Private
const updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		emai: req.body.email,
	}

	const user = await User.findById(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	})
	res.status(200).json({ success: true, data: user })
})

// @desc      update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
const updatepassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password')

	// check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Invalid Password', 401))
	}

	user.password = req.body.newPassword
	await user.save()

	sendTokenResponse(user, 200, res)
})

module.exports = {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateDetails,
	updatepassword,
	logout,
}
