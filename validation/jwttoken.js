const keys = require("../config/keys");
const jwt = require("jsonwebtoken");

//Check to make sure header is not undefined, if so, return Forbidden (403)
module.exports = function getJWTToken(req, res, next) {
	const header = req.headers['authorization'];

	if (typeof header === 'undefined') {
		res.sendStatus(403);
	}

	const bearer = header.split(' ');
	const token = bearer[1];

	//verify the JWT token generated for the user
	jwt.verify(token, keys.secretOrKey, (err, authorizedData) => {
		if(err) {
			//If error send Forbidden (403)
			console.log('ERROR: Could not connect to the protected route');
			res.sendStatus(403);
		} else {
			//If token is successfully verified, we can send the authorized data
			console.log('SUCCESS: Connected to protected route');
			req.authorizedData = authorizedData;
		}
	});


	next();
};