const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const courseRoutes = require('./routes/courseRoutes')
const courseSpecializationRoutes = require('./routes/courseSpecializationRoutes')
const errorHandler = require('./middleware/errorMiddleare')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

// Routes
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/course-specialization', courseSpecializationRoutes)

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(
	PORT,
	console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)
