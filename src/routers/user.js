const express = require(`express`);
const UserModel = require(`../models/user.js`)

//instantiate a new router
const router = new express.Router();

//settins up router routes
router.post(`/users`, async (req, res) => {	
	const testUser = new UserModel(req.body);	
	try {
		const userDocument = await testUser.save();
		console.log(`new document inserted: ${userDocument}`);
		res.status(201).send(userDocument);
	} catch(error) {		
		console.log(error);
		res.status(400).send({
			status: `failed to insert document`,
			error: error.message
		});
	}	
});

router.post(`/users/login`, async (req, res) => {
	try {
		//.findByCredentials() --> custom function defined in `../models/user.js` 
		const user = await UserModel.findByCredentials(req.body.email, req.body.password);
		res.status(200).send(user);

	} catch(error) {
		res.status(400).send();
	}

});

router.get(`/users`, async (req, res) => {	
	try {
		const users = await UserModel.find({});
		res.status(200).send(users);
	} catch(error) {
		console.log(error);
		res.status(500).send();
	}
});

router.get(`/users/:id`, async (req, res) => {
	const _id = req.params.id;
	try { //mongoose automatically converts string id --> ObjectID
		const user = await UserModel.findById(_id);
		if(!user){ //if no user with such id --> user === null
			return res.status(404).send();
		}
		res.status(200).send(user);
	} catch(error) {
		if(error.name === `CastError`) { //`findById` throws an error if an id is poorly formated
			return res.status(400).send({
				status: `failed to fetch document`,
				error: `invalid id provided`
			});
		}		
		res.status(500).send();
	}	
});

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