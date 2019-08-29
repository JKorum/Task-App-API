const mongoose = require(`mongoose`)

const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: Boolean,
		default: false
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: `User`
	}
})

const TaskModel = mongoose.model(`Task`, taskSchema)

module.exports = TaskModel