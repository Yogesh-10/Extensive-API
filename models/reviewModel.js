const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a title for the review'],
		maxlength: 100,
	},
	text: {
		type: String,
		required: [true, 'Please add some text'],
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, 'Please add a rating between 1 and 10'],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	course: {
		type: mongoose.Schema.ObjectId,
		ref: 'Course',
		required: true,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
})

// user to add only one review per bootcamp
ReviewSchema.index({ course: 1, user: 1 }, { unique: true })

// static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (courseId) {
	const obj = await this.aggregate([
		{
			$match: { course: courseId },
		},
		{
			$group: {
				_id: '$course',
				averageRating: { $avg: '$rating' },
			},
		},
	])

	try {
		await this.model('Course').findByIdAndUpdate(courseId, {
			averageRating: obj[0].averageRating,
		})
	} catch (error) {
		console.error(error)
	}
}

// call average cost after save
ReviewSchema.post('save', function () {
	this.constructor.getAverageRating(this.course)
})

// call average cost before remove
ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.course)
})

module.exports = mongoose.model('Review', ReviewSchema)
