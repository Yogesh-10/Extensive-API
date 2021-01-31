const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

// models
const Course = require('./models/courseModel')
const Coursepecialization = require('./models/coursespecializationModel')
const User = require('./models/userModel')
const Review = require('./models/reviewModel')

// DB
mongoose.connect(process.env.MONGO_URI, {
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
})

// Read JSON files
const course = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/course.json`, 'utf-8')
)

const coursespecialization = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/coursespecialization.json`, 'utf-8')
)

const users = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)

const reviews = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
)

// Import to DB
const importData = async () => {
	try {
		await Course.create(course)
		await Coursepecialization.create(coursespecialization)
		await User.create(users)
		await Review.create(reviews)
		console.log('Data imported')
		process.exit()
	} catch (error) {
		console.error(error)
	}
}

// Delete data
const deleteData = async () => {
	try {
		await Course.deleteMany()
		await Coursepecialization.deleteMany()
		await User.deleteMany()
		await Review.deleteMany()
		console.log('Data deleted')
		process.exit()
	} catch (error) {
		console.error(error)
	}
}

if (process.argv[2] === 'import') {
	importData()
} else if (process.argv[2] === 'delete') {
	deleteData()
}
