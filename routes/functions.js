

// Function to authenticate page routes, else redirects to login page
exports.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated())
        return next();

    res.redirect('/');
};