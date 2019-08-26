const express = require(`express`);
const TaskModel = require(`../models/task.js`);

//instatiating a new router
const router = new express.Router();

//setting up router routes
router.post(`/tasks`, async (req, res) => {
	const testTask = new TaskModel(req.body);
	try {
		const taskDocument = await testTask.save();
		console.log(`new document inserted: ${taskDocument}`);
		res.status(201).send(taskDocument);
	} catch(error) {
		console.log(error);
		res.status(400).send({
			status: `failed to insert document`,
			error: error.message 
		});
	}	
});

router.get(`/tasks`, async (req, res) => {
	try {
		const tasks = await TaskModel.find({});
		res.status(200).send(tasks);
	} catch(error) {
		console.log(error);
		res.status(500).send();
	}
});

router.get(`/tasks/:id`, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await TaskModel.findById(_id);
		if(!task) { //task === null --> no such task
			return res.status(404).send();
		}
		res.status(200).send(task);
	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({
				status: `failed to fetch document`,
				error: `invalid id provided`
			});
		}
		res.status(500).send();
	}	
});

router.patch(`/tasks/:id`, async (req, res) => {
	const updates = Object.keys(req.body); //consider to refactor to a function --> ./utilities/smth.js OR middleware?
	const allowedToUpdate = [`description`, `status`];
	const isValidOperation = updates.every(update => allowedToUpdate.includes(update));
	if(!isValidOperation) {
		return res.status(400).send({ error: `invalid field names` });
	}

	try { //mongoose automatically converts string id --> ObjectID
		const queryOptions = {
			new: true, //return the updated document rather then the original 
			runValidators: true //run the schema validators against the updating object
		};
		const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, queryOptions);
		if(!updatedTask) { //if no task with a correctly formated id --> updatedTask === null
			return res.status(404).send();
		}
		res.status(200).send(updatedTask);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({ error: `invalid value for id field` });
		}
		res.status(400).send(error); //for validation errors --> refactor sending data
	}
});

router.delete(`/tasks/:id`, async (req, res) => { 
	try {
		const deletedTask = await TaskModel.findByIdAndDelete(req.params.id);
		if(!deletedTask) { //if no task with a correctly formated id --> deletedTask === null
			return res.status(404).send();
		}
		res.status(200).send(deletedTask);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({ error: `invalid value for id field` }); // set up a middleware or a utility
		}
		res.status(500).send();
	}
});

module.exports = router;