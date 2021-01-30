const mongoose = require('mongoose')

const CourseSpecializationSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a course title'],
	},
	description: {
		type: String,
		required: [true, 'Please add a description'],
	},
	weeks: {
		type: String,
		required: [true, 'Please add number of weeks'],
	},
	tuition: {
		type: Number,
		required: [true, 'Please add a tuition cost'],
	},
	minimumSkill: {
		type: String,
		required: [true, 'Please add a minimum skill'],
		enum: ['beginner', 'intermediate', 'advanced'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	course: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course',
		required: true,
	},
})

// static method to get average of course tuitions
CourseSpecializationSchema.statics.getAverageCost = async function (courseId) {
	const obj = await this.aggregate([
		{
			$match: { course: courseId },
		},
		{
			$group: {
				_id: '$course',
				averageCost: { $avg: '$tuition' },
			},
		},
	])

	try {
		await this.model('Course').findByIdAndUpdate(courseId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
		})
	} catch (error) {
		console.error(error)
	}
}

// call average cost after save
CourseSpecializationSchema.post('save', function () {
	this.constructor.getAverageCost(this.course)
})

// call average cost before remove
CourseSpecializationSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.course)
})

module.exports = mongoose.model(
	'Coursespecialization',
	CourseSpecializationSchema
)
