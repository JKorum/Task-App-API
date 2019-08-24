const mongoose = require(`mongoose`);
const { isEmail } = require(`validator`);

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

//model used to manipulate collection, instantiate documents 
const UserModel = mongoose.model(`User`, userSchema);

module.exports = UserModel;