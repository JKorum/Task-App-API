const express = require(`express`)
require(`./db/mongoose`) //loads and runs the script that establishes connection to the db
const userRouter = require(`./routers/user`)
const taskRouter = require(`./routers/task`)

const app = express()

//parsing incoming request body as JSON --> JS object
app.use(express.json()) 

app.use(userRouter)
app.use(taskRouter)

module.exports = app