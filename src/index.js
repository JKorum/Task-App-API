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
app.post(`/users`, (req, res) => {
	const testUser = new UserModel(req.body); //should be validation on the server side
	testUser.save()
		.then(userDocument => {
			console.log(`new document inserted: ${userDocument}`);
			res.status(201).send(userDocument);
		})
		.catch(error => {
			console.log(`failed to insert document: ${error}`);
			res.status(400).send({
				status: `failed to insert document`,
				error: error //should send some particular properies 
			});
		});	
});

app.post(`/tasks`, (req, res) => {
	const testTask = new TaskModel(req.body); //should be validation on the server side
	testTask.save()
		.then(taskDocument => {
			console.log(`new document inserted: ${taskDocument}`);
			res.status(201).send(taskDocument);
		})
		.catch(error => {
			console.log(`failed to insert document: ${error}`);
			res.status(400).send({
				status: `failed to insert document`,
				error: error //should send some particular properies 
			});
		});
});

app.get(`/users`, (req, res) => {
	UserModel.find({})
		.then(users => {
			res.status(200).send(users);
		})
		.catch(error => {
			console.log(`failed to fetch documents: ${error}`);
			res.status(500).send();
		});
});

app.get(`/users/:id`, (req, res) => {
	const _id = req.params.id;

	//mongoose automatically converts string id --> ObjectID
	UserModel.findById(_id) //if no user with such id the success handler also will be triggered
		.then(user => {				//if no user with such id --> user === null
			if(!user){
				return res.status(404).send();
			}
			res.status(200).send(user);
		})
		.catch(error => { 
			if(error.name === `CastError`){ //.findById throws an error if an id is poorly formated
				return res.status(400).send({
					status: `failed to fetch document`,
					error: `invalid id provided`
				});
			}			
			res.status(500).send();
		});
});

app.get(`/tasks`, (req, res) => {
	TaskModel.find({})
		.then(tasks => {
			res.status(200).send(tasks);
		})
		.catch(error => {
			console.log(`failed to fetch documents: ${error}`);
			res.status(500).send();
		})
});

app.get(`/tasks/:id`, (req, res) => {
	const _id = req.params.id;

	TaskModel.findById(_id)
		.then(task => {
			if(!task){ //task === null --> no such task
				return res.status(404).send();
			}
			res.status(200).send(task);
		})
		.catch(error => {
			if(error.name === `CastError`){ //.findById throws an error if an id is poorly formated
				return res.status(400).send({
					status: `failed to fetch document`,
					error: `invalid id provided`
				});
			}			
			res.status(500).send();
		});

});

app.listen(port, () => console.log(`server is listening on port ${port}`));