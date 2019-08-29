const mongoose = require(`mongoose`)
const { isEmail } = require(`validator`)
const bcrypt = require(`bcrypt`)
const jwt = require(`jsonwebtoken`)

/* mongoose: schema --> model --> document
	 schema used to shape documents
	 trim, lowercase --> sanitizers (before validation)
	 required, minlength --> built in validators
	 validate --> customizable validator */
const userSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		unique: true, 
		required: true,
		trim: true,
		lowercase: true,
		validate(value){
			if(!isEmail(value)) throw new Error(`invalid email syntax`)
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value){
			if(/password/i.test(value)) throw new Error(`word 'password' shouldn't be used`)
		}
	},
	age: {
		type: Number,
		default: 0,
		validate(value){
			if(value < 0) throw new Error(`negative number provided`)
		}
	},
	tokens: [{ //mongoose generated [] by default
		token: {  
			type: String,
			required: true
		}
	}]			
})

//virtual properties
userSchema.virtual(`tasks`, {
	ref: `Task`,
	localField: `_id`,
	foreignField: `owner`
})

//model method to call on UserModel 
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await UserModel.findOne({ email })
	if(!user) throw new Error(`unable to login`)

	const isMatch = await bcrypt.compare(password, user.password)
	if(!isMatch) throw new Error(`unable to login`)

	return user
}

/* instance methods to call on an UserModel instance (user document)
	 use standart function declaration --> to bind `this` */
userSchema.methods.generateAuthToken = async function () {
	const userDocument = this

	const token = await jwt.sign({ _id: userDocument._id.toString() }, `token signature`)
	userDocument.tokens = userDocument.tokens.concat({ token }) //mongoose throws error if used `push`  
	await userDocument.save()
	return token
}

userSchema.methods.toJSON = function () { //will be called by JSON.stringify()
	const user = this
	
	const userRawObject = user.toObject() //to clone user document --> JS obj (contains only props defined in userSchema)	
	delete userRawObject.password
	delete userRawObject.tokens

	return userRawObject //this obj will be serialized by JSON.stringify()
}

//document methods middleware --> hash plain pasword before saving
userSchema.pre(`save`, async function (next) {
	const userDocument = this

	//following block will run when a document is created and also updated
	if(userDocument.isModified(`password`)) { //to check if password field has been modified
		userDocument.password = await bcrypt.hash(userDocument.password, 8)
	}

	next()
})

//model used to perform operations on collection and to instantiate documents 
const UserModel = mongoose.model(`User`, userSchema)

module.exports = UserModel