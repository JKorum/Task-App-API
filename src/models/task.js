const mongoose = require(`mongoose`)

const options = {
	timestamps: true 
}

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
}, options)

const TaskModel = mongoose.model(`Task`, taskSchema)

module.exports = TaskModel