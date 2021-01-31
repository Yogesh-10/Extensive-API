const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/userModel')

// protect routes
const protect = asyncHandler(async (req, res, next) => {
	let token

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1]
	}
	// else if(req.cookies.token){
	//     token = req.cookies.token
	// }

	// check if token exists
	if (!token) {
		return next(new ErrorResponse(`Not authorized to acess this resource`, 401))
	}

	try {
		// verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		req.user = await User.findById(decoded.id) //taking the token from user(req.user), i.e logged in user and decode it
		next()
	} catch (error) {
		return next(new ErrorResponse(`Not authorized to acess this resource`, 401))
	}
})

// Grant access to specific roles
// the rest operator takes ...roles and convert to space seperated values when function is called
const authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`user role ${req.user.role} is not authorized to acess this resource`,
					403
				) //403 - forbidden
			)
		}
		next()
	}
}

module.exports = { protect, authorize }
