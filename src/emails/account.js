const sgMail = require(`@sendgrid/mail`)

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: `constantine.proshin@gmail.com`,
		subject: `Thanks for joining in!`,
		text: `Welcome to Task Manager, ${name}! We hope you'll find its features helpfull.`
	})
}

const farewellEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: `constantine.proshin@gmail.com`,
		subject: `Sadly that you're going away`,
		text: `${name}, your account has been deleted from Task Manager. Farawell, friend!`
	})
}

module.exports = {
	sendWelcomeEmail,
	farewellEmail
}