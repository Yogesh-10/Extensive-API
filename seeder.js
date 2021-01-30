const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

// models
const Course = require('./models/courseModel')
const Coursepecialization = require('./models/coursespecializationModel')

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

// Import to DB
const importData = async () => {
	try {
		await Course.create(course)
		await Coursepecialization.create(coursespecialization)
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
