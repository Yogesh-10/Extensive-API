const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const courseRoutes = require('./routes/courseRoutes')
const courseSpecializationRoutes = require('./routes/courseSpecializationRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const errorHandler = require('./middleware/errorMiddleware')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

app.use(fileUpload())
app.use(cookieParser())

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/course-specialization', courseSpecializationRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(
	PORT,
	console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)
