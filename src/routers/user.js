const express = require(`express`)
const UserModel = require(`../models/user`)
const TaskModel = require(`../models/task`)
const auth = require(`../middleware/auth`)

const router = new express.Router()

//public route --> sign up 
router.post(`/users`, async (req, res) => {	
	const testUser = new UserModel(req.body)

	try {
		const userDocument = await testUser.save()
		const token = await userDocument.generateAuthToken()
		res.status(201).send({ userDocument, token })

	} catch(e) {				
			res.status(400).send({ error: e.message })
	}	
})

//public route --> log in
router.post(`/users/login`, async (req, res) => {
	try {
		const { email, password } = req.body		
		const user = await UserModel.findByCredentials(email, password)
		const token = await user.generateAuthToken()
		res.status(200).send({ user, token })

	} catch(e) {		
			res.status(400).send({ error: e.message })
	}
})

//auth route --> log out (current session)
router.post(`/users/logout`, auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(tokenDocument => tokenDocument.token !== req.token)
		await req.user.save()
		res.status(200).send()

	} catch (e) {
			res.status(500).send()
	}
})

//auth route --> log out (all sessions)
router.post(`/users/logoutall`, auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.status(200).send()

	} catch (e) {
			res.status(500).send()
	}
})

//auth route --> send profile 
router.get(`/users/me`, auth, async (req, res) => {	
	res.status(200).send(req.user)	
})

//auth route --> update profile 
router.patch(`/users/me`, auth, async (req, res) => {
	const updates = Object.keys(req.body) 
	const allowedToUpdate = [`name`, `email`, `password`, `age`]
	const isValidOperation = updates.every(update => allowedToUpdate.includes(update))
	if(!isValidOperation) {
		return res.status(400).send({ error: `invalid update names` })
	}

	try {		 
		updates.forEach(update => req.user[update] = req.body[update])
		await req.user.save()		
		res.status(200).send(req.user)

	} catch(e) {
			if (e.name === `ValidationError`) {
				return res.status(400).send({ error: e.message })
			}
		
			res.status(500).send()
	}
})

//auth route --> delete profile 
router.delete(`/users/me`, auth, async (req, res) => {
	try {		
		const result = await UserModel.deleteOne({ _id: req.user._id })
		if (result.deletedCount === 1) { //mimic atomic operation
			await TaskModel.deleteMany({ owner: req.user._id }) //delete all user's tasks after removing the user		
		}
		res.status(200).send(req.user)

	} catch(e) {		
			res.status(500).send()
	}		
})

module.exports = router