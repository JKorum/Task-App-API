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

app.listen(port, () => console.log(`server is listening on port ${port}`));