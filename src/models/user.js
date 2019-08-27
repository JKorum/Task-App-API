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
		unique: true, // creates an index in mongodb db (recreate db --> to get it to work)
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

//the method to call on UserModel
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await UserModel.findOne({ email }); 


	if(!user) {
		throw new Error(`unable to login`);
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if(!isMatch) {
		throw new Error(`unable to login`);
	}

	return user; //return a promise resolved with user value

};


//registering `document middleware` --> hash plain pasword before saving
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