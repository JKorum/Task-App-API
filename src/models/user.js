const mongoose = require(`mongoose`);
const { isEmail } = require(`validator`);
const bcrypt = require(`bcrypt`);

//schema used to shape documents
//trim, lowercase --> sanitizers used before validation
//required, minlength --> built in validators
//validate() --> custom validation method
const userSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate(value){
			if(!isEmail(value)) throw new Error(`invalid email syntax`);
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value){
			if(/password/i.test(value)) throw new Error(`substring 'password' shouldn't be used`);
		}
	},
	age: {
		type: Number,
		default: 0,
		validate(value){
			if(value < 0) throw new Error(`negative number provided`);
		}
	}			
});

//registering `document middleware`
userSchema.pre(`save`, async function (next) {
	const userDocument = this; //to obtain more clear syntax

	//following block will run when a document is created and also updated
	if(userDocument.isModified(`password`)) { //to check if password field has been modified
		userDocument.password = await bcrypt.hash(userDocument.password, 8);
	}

	next();
});


//model used to manipulate collection, instantiate documents 
const UserModel = mongoose.model(`User`, userSchema);

module.exports = UserModel;