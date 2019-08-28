const express = require(`express`)
const UserModel = require(`../models/user`)
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



router.patch(`/users/:id`, async (req, res) => { //properties is req.body that don't exist in UserSchema are ignored
	const updates = Object.keys(req.body); 
	const allowedToUpdate = [`name`, `email`, `password`, `age`];
	const isValidOperation = updates.every(update => allowedToUpdate.includes(update));
	if(!isValidOperation) {
		return res.status(400).send({ error: `invalid field names provided` }); //unify error sending objects' structure
	}

	try { //mongoose automatically converts string id --> ObjectID
		const queryOptions = {
			new: true, //return the updated document rather then the original 
			runValidators: true //run the schema validators against the updating object
		};

		//this block is designed to trigger `document middleware` --> it uses .save()
		const userToUpdate = await UserModel.findById(req.params.id);

		if(!userToUpdate) { //if no user with a correctly formated id --> userToUpdate === null
			return res.status(404).send();
		}

		updates.forEach(fieldName => userToUpdate[fieldName] = req.body[fieldName]);
		await userToUpdate.save();
		//the old code:
		//const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, queryOptions);
		
		res.status(200).send(userToUpdate);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({
				status: `failed to fetch document`,
				error: `invalid id provided`
			});
		}
		res.status(400).send(error); //for validation errors --> refactor sending data
	}
});

router.delete(`/users/:id`, async (req, res) => {
	try {
		const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
		if(!deletedUser) { //if no user with a correctly formated id --> deletedUser === null
			return res.status(404).send();
		}
		res.status(200).send(deletedUser);

	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({ error: `invalid value for id field` }); // set up a middleware or a utility
		}
		res.status(500).send();
	}		
});

module.exports = router;