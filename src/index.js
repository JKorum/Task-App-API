const express = require(`express`)
require(`./db/mongoose`) //loads and runs the script that establishes connection to the db
const userRouter = require(`./routers/user`)
const taskRouter = require(`./routers/task`)

//server configuration and environmental variables
const app = express()
const port = process.env.PORT || 3000

//parsing incoming request body as JSON --> JS object
app.use(express.json()) 

//registered routers
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => console.log(`server is listening on port ${port}`))