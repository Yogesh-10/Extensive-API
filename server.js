const path = require('path')
const dotenv = require('dotenv')
const express = require('express')
const connectDB = require('./config/db')
const courseRoutes = require('./routes/courseRoutes')
const courseSpecializationRoutes = require('./routes/courseSpecializationRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const errorHandler = require('./middleware/errorMiddleware')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const expressMongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

app.use(cookieParser())

app.use(fileUpload())

// mongo sanitize
app.use(expressMongoSanitize())

// set security headers
app.use(helmet())

// prevent cross side(xss) scripting
app.use(xss())

// Rate limit
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, //10 minutes
	max: 100,
})

// prevent http params pollution
app.use(hpp())

// Enable cors
app.use(cors())

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/course-specialization', courseSpecializationRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/reviews', reviewRoutes)

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(
	PORT,
	console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)
