const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
	let error = { ...err }

	error.message = err.message
	// log to console only for development
	console.log(err)

	// Mongoose error for Not a validId
	if (err.name === 'CastError') {
		const message = `Resource not found with id of ${err.value}`
		error = new ErrorResponse(message, 404)
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = 'Duplicate field value (Already Exists)'
		error = new ErrorResponse(message, 400)
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map((val) => val.message)
		error = new ErrorResponse(message, 400)
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message,
	})
}

module.exports = errorHandler