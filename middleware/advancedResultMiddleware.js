// below method is shorthand of calling function inside another function
const advancedResultMiddleware = (model, populate) => async (
	req,
	res,
	next
) => {
	let query

	// create a copy of req.query
	const reqQuery = { ...req.query }

	// Fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit']

	// Loop and removeFields and delete from reqQuery
	removeFields.forEach((param) => delete reqQuery[param])

	// ceate a query string
	let querystr = JSON.stringify(reqQuery)

	// create operators($lte, $gte, etc...)
	querystr = querystr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

	// Finding resource
	query = model.find(JSON.parse(querystr))

	// select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ')
		query = query.select(fields)
	}

	// sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ')
		query = query.sort(sortBy)
	} else {
		query = query.sort('-createdAt') //descending createdAt
	}

	// pagination-limit
	const page = parseInt(req.query.page, 10) || 1
	const limit = parseInt(req.query.limit, 10) || 20
	const startIndex = (page - 1) * limit
	const endIndex = page * limit
	const total = await model.countDocuments()

	query = query.skip(startIndex).limit(limit)

	if (populate) {
		query = query.populate(populate)
	}

	// query Execution
	const results = await query

	// pagination result
	const pagination = {}
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		}
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		}
	}
	// create a object to use this middleware all over the application
	res.advancedResultMiddleware = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	}
	next()
}

module.exports = advancedResultMiddleware
