const mongoose = require(`mongoose`);

const configConnection = {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
};

//task-manager-api --> name of the database to connect 
mongoose.connect(`mongodb://127.0.0.1:27017/task-manager-api`, configConnection);

const db = mongoose.connection;

//should be some logic for connection error handling 
db.then(result => {
	console.log(`connected to the database: ${result.name}`);
}).catch(error => {
	console.log(`error occured in database connection: ${error}`);
});