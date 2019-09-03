const request = require(`supertest`) 
const app = require(`../src/app`)
const UserModel = require(`../src/models/user`)
const TaskModel = require(`../src/models/task`)

//module for database state configuration
const { 
	userOneId, 
	userOne, 
	wrongUser, 
	setupDatabase 
} = require(`./fixtures/db`)

beforeEach(setupDatabase)

//cases for SIGNUP route
test(`should signup user`, async () => {
	const response = await request(app).post(`/users`).send({
		name: `Korum crow`,
		email: `test@mail.com`,
		password: `fish12345`
	}).expect(201)	

	//assert that the database was changed correctly
	const user = await UserModel.findById(response.body.userDocument._id)
	expect(user).not.toBeNull()

	//assertions about the response 
	//check singular property
	expect(response.body.userDocument.name).toBe(`Korum crow`)

	//check multiple properies
	expect(response.body).toMatchObject({ //specified properties should match response.body
		userDocument: {											//response.body can contain another properties
			name: `Korum crow`,
			email: `test@mail.com`
		}, 
		token: user.tokens[0].token
	})

	//assert that user password had been hashed
	expect(user.password).not.toBe(`fish12345`)
})

test(`shouldn't signup user with invalid input`, async () => {
	const initialInput = { name: `Lora`, email: `lora@gmail.com`, age: 54 }

	await request(app)
		.post(`/users`)
		.send({ ...initialInput, email: `wrongemail` })
		.expect(400)

	let initialUsers = await UserModel.find({})
	expect(initialUsers).toHaveLength(2)

	await request(app)
		.post(`/users`)
		.send({ ...initialInput, password: 123 })
		.expect(400)

	initialUsers = await UserModel.find({})
	expect(initialUsers).toHaveLength(2)

	await request(app)
		.post(`/users`)
		.send({ ...initialInput, password: `password` })
		.expect(400)

	initialUsers = await UserModel.find({})
	expect(initialUsers).toHaveLength(2)

	await request(app)
		.post(`/users`)
		.send({ ...initialInput, age: -3 })
		.expect(400)

	initialUsers = await UserModel.find({})
	expect(initialUsers).toHaveLength(2)

	await request(app)
		.post(`/users`)
		.send({ ...initialInput, email: userOne.email })
		.expect(400)
})

//cases for LOGIN route
test(`should login existing user`, async () => {
	const response = await request(app).post(`/users/login`).send({
		email: userOne.email,
		password: userOne.password
	}).expect(200)

	const userFromDB = await UserModel.findById(userOneId)	
	expect(userFromDB.tokens[2].token).toBe(response.body.token)	
})

test(`shouldn't login nonexistent user`, async () => {
	await request(app).post(`/users/login`).send({
		email: wrongUser.email,
		password: wrongUser.password
	}).expect(400)
})

//cases for LOGOUT route (current session)
test(`should logout user from current session`, async () => {
	await request(app)
		.post(`/users/logout`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await UserModel.findById(userOne._id)
	expect(user.tokens.includes(userOne.tokens[0].token))
})

//cases for LOGOUT route (all session)
test(`should logout user from all sessions`, async () => {
	await request(app)
		.post(`/users/logoutall`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await UserModel.findById(userOne._id)
	expect(user.tokens).toHaveLength(0)
})

//cases for FETCH PROFILE route
test(`should get user profile`, async () => {
	await request(app)
		.get(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
})

test(`shouldn't get profile for unauthenticated user`, async () => {
	await request(app)
		.get(`/users/me`)
		.send()
		.expect(401)
})

//cases for UPDATE PROFILE route 
test(`shouldn't update account for unauthenticated user`, async () => {
	await request(app)
		.patch(`/users/me`)
		.send({ name: `updated name` })
		.expect(401)
})

test(`should update user account`, async () => {
	await request(app)
		.patch(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ name: `Lilu Update`, password: `update12345`})
		.expect(200)

	const user = await UserModel.findById(userOneId)	
	expect(user.name).toBe(`Lilu Update`)
	expect(user.password).not.toEqual(`update12345`)
})

test(`shouldn't update user account with invalid input`, async () => {
	await request(app)
		.patch(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ color: `red` })
		.expect(400)

	await request(app)
		.patch(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ email: `wrongmail` })
		.expect(400)

	await request(app)
		.patch(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ password: `password` })
		.expect(400)

	await request(app)
		.patch(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send({ name: `` })
		.expect(400)	
})

//cases for DELETE PROFILE route 
test(`should delete user account and tasks`, async () => {
	await request(app)
		.delete(`/users/me`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await UserModel.findById(userOneId)	
	expect(user).toBeNull()

	const userTasks = await TaskModel.find({ owner: userOne._id })
	expect(userTasks).toHaveLength(0)
})

test(`shouldn't delete account for unauthenticated user`, async () => {
	await request(app)
		.delete(`/users/me`)
		.send()
		.expect(401)

	const user = await UserModel.findById(userOne._id)
	expect(user).not.toBeNull()
})

//cases for UPLOAD AVATAR route 
test(`should upload avatar image`, async () => {
	await request(app)
		.post(`/users/me/avatar`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.attach(`avatar`, `tests/fixtures/profile-pic.jpg`)
		.expect(200)
	
	const user = await UserModel.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer)) //check if user.avatar mathes any Buffer
})

//cases for DELETE AVATAR route 
test(`should delete user avatar`, async () => {
	await request(app)
		.post(`/users/me/avatar`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.attach(`avatar`, `tests/fixtures/profile-pic.jpg`)
		.expect(200)

	await request(app)
		.delete(`/users/me/avatar`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await UserModel.findById(userOne._id)
	expect(user.avatar).toEqual(undefined)
})

//cases for FETCH AVATAR route
test(`should fetch avatar image`, async () => {
	await request(app)
		.post(`/users/me/avatar`)
		.set(`Authorization`, `Bearer ${userOne.tokens[0].token}`)
		.attach(`avatar`, `tests/fixtures/profile-pic.jpg`)
		.expect(200)

	const response = await request(app)
		.get(`/users/${userOne._id}/avatar`)
		.send()
		.expect(200)

	expect(response.body).toEqual(expect.any(Buffer))
})