const request = require(`supertest`)
const app = require(`../src/app`)
const TaskModel = require(`../src/models/task`)
const UserModel = require(`../src/models/user`)

//module for database state configuration
const { 
	userOneId, 
	userOne, 
	userTwo, 
	wrongUser, 
	setupDatabase, 
	taskOne,
	taskThree 
} = require(`./fixtures/db`)

beforeEach(setupDatabase)

//cases for CREATE TASK route 
test(`shouldn't create task for unauthenticated user`, async () => {
	const validInput = { description: `catch a fat crow`, status: true }

	await request(app)
		.post(`/tasks`)		
		.send(validInput)
		.expect(401)
})

test(`should create task for user with valid input`, async () => {	
	const validInput = { description: `catch a fat crow`, status: true }	

	const response_1 = await request(app)
		.post(`/tasks`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send(validInput)
		.expect(201)

	const newTaskFromDb = await TaskModel.findById(response_1.body._id)	
	expect(newTaskFromDb).not.toBeNull()
	expect(newTaskFromDb).toMatchObject(validInput)	

	const response_2 = await request(app)
		.post(`/tasks`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ description: validInput.description })
		.expect(201)

	expect(response_2.body.status).toEqual(false)
	expect(response_2.body.description).toEqual(validInput.description)
})

test(`shouldn't create task for user with invalid input`, async () => {
	const invalidInput_value = { description: 123, status: `not boolean` }
	const invalidInput_key = { smth: 123, crow: true }

	await request(app)
		.post(`/tasks`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send(invalidInput_value)
		.expect(400) 	

	await request(app)
		.post(`/tasks`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send(invalidInput_key)
		.expect(400)

	const initialTasks = await TaskModel.find({ owner: userOne._id})
	expect(initialTasks).toHaveLength(2) //userOne initially had two tasks 
})

//cases for READ ALL TASK route (options)
test(`shouldn't fetch tasks for unauthenticated user`, async () => {
	await request(app)
		.get(`/tasks`)
		.send()		
		.expect(401)
})

test(`should fetch tasks for user`, async () => { //pagination option is untested (need populate tests/fixtures/db with tasks)
	const response_1 = await request(app)
		.get(`/tasks`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	expect(response_1.body).toHaveLength(2) //userOne initially had two tasks 

	const response_2 = await request(app)
		.get(`/tasks?status=true`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	expect(response_2.body).toHaveLength(1)
	expect(response_2.body[0].description).toEqual(taskOne.description)

	const response_3 = await request(app)
		.get(`/tasks?status=false`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	expect(response_3.body).toHaveLength(1)
	expect(response_3.body[0].description).toEqual(taskThree.description)

	const response_4 = await request(app)
		.get(`/tasks?sortby=createdAt:desc`) //new to old 
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)	

	let timeStamp_1 = new Date(response_4.body[0].createdAt)
	let timeStamp_2 = new Date(response_4.body[1].createdAt)

	expect(timeStamp_1 > timeStamp_2).toEqual(true)

	const response_5 = await request(app)
		.get(`/tasks?sortby=createdAt:asc`) //old to new 
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	timeStamp_1 = new Date(response_5.body[0].createdAt)
	timeStamp_2 = new Date(response_5.body[1].createdAt)

	expect(timeStamp_1 < timeStamp_2).toEqual(true)
})

//cases for READ A SINGLE TASK route
test(`shouldn't fetch task for unauthenticated user`, async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)		
		.send()
		.expect(401)
})

test(`should fetch task for user`, async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)	
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)	
		.send()
		.expect(200)
})

test(`shouldn't fetch task of other user`, async () => {
	await request(app)
		.get(`/tasks/${taskOne._id}`)	
		.set(`Authorization`, `Bearer ${userTwo.tokens[0].token}`)	
		.send()
		.expect(404)
})

test(`shouldn't fetch task with invalid id`, async () => {
	await request(app)
		.get(`/tasks/1234`)	
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)	
		.send()
		.expect(400)
})

//test cases for UPDATE A SINGLE TASK route
test(`shouldn't update task for unauthenticated user`, async () => {
	const validInput = { description: `updated discription`, status: false }

	await request(app)
		.patch(`/tasks/${taskOne._id}`)		
		.send(validInput)
		.expect(401)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase).toMatchObject(taskOne)
})

test(`shouldn't update task with invalid input`, async () => {
	const invalidInput_1 = { _id: 123, owner: `me` }

	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)		
		.send(invalidInput_1)
		.expect(400)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase).toMatchObject(taskOne)

	const invalidInput_2 = { description: true, status: 123 }

	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)		
		.send(invalidInput_2)
		.expect(400)

	const taskFromDatabase_2 = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase_2).toMatchObject(taskOne)

	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)		
		.send({})
		.expect(400)

	const taskFromDatabase_3 = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase_3).toMatchObject(taskOne)
})

test(`should update user task`, async () => {
	const validInput = { description: `update`, status: false }

	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send(validInput)
		.expect(200)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase).toMatchObject(validInput)
})

test(`shouldn't update task by authorized user that is not owner`, async () => {
	const validInput = { description: `update`, status: false }

	await request(app)
		.patch(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userTwo.tokens[0].token}`)
		.send(validInput)
		.expect(404)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)
	expect(taskFromDatabase).toMatchObject(taskOne)
})

//test cases for DELETE A SINGLE TASK route
test(`shouldn't delete task for unauthenticated user`, async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)		
		.send()
		.expect(401)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)	
	expect(taskFromDatabase).not.toBeNull()
})

test(`shouldn't delete task by authorized user that is not owner`, async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userTwo.tokens[0].token}`)
		.send()
		.expect(404)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)	
	expect(taskFromDatabase).not.toBeNull()
})

test(`should delete user task`, async () => {
	await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const taskFromDatabase = await TaskModel.findById(taskOne._id)	
	expect(taskFromDatabase).toBeNull()
})