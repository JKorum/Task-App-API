const express = require(`express`);
require(`./db/mongoose.js`); // --> loads and runs the script that establishes connection to the db
const UserModel = require(`./models/user.js`);
const TaskModel = require(`./models/task.js`);

//server configuration and environmental variables
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(express.json()); //parsing incoming request body as JSON --> JS object

//routes 
app.post(`/users`, async (req, res) => {	
	const testUser = new UserModel(req.body);	
	try {
		const userDocument = await testUser.save();
		console.log(`new document inserted: ${userDocument}`);
		res.status(201).send(userDocument);
	} catch(error) {		
		console.log(error);
		res.status(400).send({
			status: `failed to insert document`,
			error: error.message
		});
	}	
});

app.post(`/tasks`, async (req, res) => {
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

app.get(`/users`, async (req, res) => {	
	try {
		const users = await UserModel.find({});
		res.status(200).send(users);
	} catch(error) {
		console.log(error);
		res.status(500).send();
	}
});

app.get(`/users/:id`, async (req, res) => {
	const _id = req.params.id;
	try { //mongoose automatically converts string id --> ObjectID
		const user = await UserModel.findById(_id);
		if(!user){ //if no user with such id --> user === null
			return res.status(404).send();
		}
		res.status(200).send(user);
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

app.get(`/tasks`, async (req, res) => {
	try {
		const tasks = await TaskModel.find({});
		res.status(200).send(tasks);
	} catch(error) {
		console.log(error);
		res.status(500).send();
	}
});

app.get(`/tasks/:id`, async (req, res) => {
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

app.patch(`/users/:id`, async (req, res) => { //properties is req.body that don't exist in UserSchema are ignored
	const updates = Object.keys(req.body); 
	const allowedToUpdate = [`name`, `email`, `password`, `age`];
	const isValidOperation = updates.every(update => allowedToUpdate.includes(update));
	if(!isValidOperation) {
		return res.status(400).send({ error: `invalid field names provided` }); //unify error sending objects' structure
	}

	try { //mongoose automatically converts string id --> ObjectID
		const queryOptions = {
			new: true, //return the updated document rather then the original 
			runValidators: true //run the schema validators against the updating object
		};
		const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, queryOptions);
		if(!updatedUser) { //if no user with a correctly formated id --> updatedUser === null
			return res.status(404).send();
		}
		res.status(200).send(updatedUser);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({
				status: `failed to fetch document`,
				error: `invalid id provided`
			});
		}
		res.status(400).send(error); //for validation errors --> refactor sending data
	}
});

app.patch(`/tasks/:id`, async (req, res) => {
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

app.delete(`/users/:id`, async (req, res) => {
	try {
		const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
		if(!deletedUser) { //if no user with a correctly formated id --> deletedUser === null
			return res.status(404).send();
		}
		res.status(200).send(deletedUser);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({ error: `invalid value for id field` }); // set up a middleware or a utility
		}
		res.status(500).send();
	}		
});

app.delete(`/tasks/:id`, async (req, res) => { 
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

app.listen(port, () => console.log(`server is listening on port ${port}`));