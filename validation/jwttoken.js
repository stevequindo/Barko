const keys = require("../config/keys");
const jwt = require("jsonwebtoken");

//Check to make sure header is not undefined, if so, return Forbidden (403)
module.exports = function getJWTToken(req, res, next) {
	const header = req.headers['authorization'];

	if (typeof header !== 'undefined') {
		const bearer = header.split(' ');
		const token = bearer[1];

		//verify the JWT token generated for the user
		jwt.verify(token, keys.secretOrKey, (err, authorizedData) => {
			if (err) {
				res.sendStatus(403);
			} else {
				//If token is successfully verified, we can send the authorized data
				req.authorizedData = authorizedData;
			}
		});

	} else {
		res.sendStatus(403);
	}

	next();
};