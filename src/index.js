const express = require(`express`);
require(`./db/mongoose.js`); // --> loads and runs the script that establishes connection to the db
const userRouter = require(`./routers/user.js`);
const taskRouter = require(`./routers/task.js`);

//server configuration and environmental variables
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(express.json()); //parsing incoming request body as JSON --> JS object

//registering routers
app.use(userRouter); 
app.use(taskRouter);

app.listen(port, () => console.log(`server is listening on port ${port}`));