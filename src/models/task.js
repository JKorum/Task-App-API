const mongoose = require(`mongoose`);

//schema used to shape documents
const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: Boolean,
		default: false
	}
});	

//model used to manipulate collection, instantiate documents
const TaskModel = mongoose.model(`Task`, taskSchema);

module.exports = TaskModel;