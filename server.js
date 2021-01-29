const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const courseRoutes = require('./routes/courseRoutes')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())

// Routes
app.use('/api/v1/courses', courseRoutes)

const PORT = process.env.PORT

app.listen(
	PORT,
	console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`)
)
