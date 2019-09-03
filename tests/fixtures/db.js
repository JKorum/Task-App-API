const mongoose = require(`mongoose`)
const jwt = require(`jsonwebtoken`)
const UserModel = require(`../../src/models/user`)
const TaskModel = require(`../../src/models/task`)

//initial users in `task-manager-api-test`
const userOneId = new mongoose.Types.ObjectId()

const userOne = {
	_id: userOneId,
	name: `Lilu`,
	email: `lilu@mail.com`,
	password: `lilulilu123`,
	tokens: [{
		token: jwt.sign({ _id: userOneId }, process.env.TOKEN_SIGNATURE)
	},
	{
		token: jwt.sign({ _id: userOneId }, process.env.TOKEN_SIGNATURE)
	}]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
	_id: userTwoId,
	name: `Korum`,
	email: `korum@mail.com`,
	password: `korumkorum123`,
	tokens: [{
		token: jwt.sign({ _id: userTwoId }, process.env.TOKEN_SIGNATURE)
	}]
}

//initial tasks in `task-manager-api-test`
const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: `go to the bathroom`,
	status: true,
	owner: userOneId
}

const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: `go shoping`,
	status: false,
	owner: userTwoId
}

const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: `hit the gym`,
	status: false,
	owner: userOneId
}

//maybe remove??
const wrongUser = {
	email: `madcrow@mail.com`,
	password: `crow12345`
}

//initial state of `task-manager-api-test`
const setupDatabase = async () => {
	await UserModel.deleteMany()
	await TaskModel.deleteMany()

	await new UserModel(userOne).save()
	await new UserModel(userTwo).save()
	await new TaskModel(taskOne).save()
	await new TaskModel(taskTwo).save()
	await new TaskModel(taskThree).save()	
}

module.exports = {
	userOneId,
	userOne,
	wrongUser,
	setupDatabase,
	taskOne,
	userTwo,
	taskThree
}