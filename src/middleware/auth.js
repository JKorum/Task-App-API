const jwt = require(`jsonwebtoken`)
const UserModel = require(`../models/user`)

const auth = async (req, res, next) => {	
	try {
		const token = req.get(`Authorization`).replace(`Bearer `, ``)
		const decodedPayload = jwt.verify(token, `token signature`)

		/* `tokens.token`: token --> to check if the token is still part of tokens array of the user document
		    if the user logs out --> the token will be deleted but will be still VALID */
		const user = await UserModel.findOne({ _id: decodedPayload._id, 'tokens.token': token})

		if (!user) throw new Error()
			
		//give route handlers an access to the token and the user obj
		req.token = token
		req.user = user 
		next()

	} catch(e) {
		res.status(401).send({ error: `authentication failed` })
	}
}

module.exports = auth