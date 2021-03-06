
const func = require(__dirname + "/functions.js");

module.exports = function(app, passport) {
	
	app.get('/', function(req,res){
	    res.render('index.ejs', {message: req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login', {
	    successRedirect : '/profile', // redirect to the secure profile section
	    failureRedirect : '/', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

	app.get('/signup', function(req,res){
	    res.render('signup.ejs', {message: req.flash('signupMessage')});
	});

	app.post('/signup', passport.authenticate('local-signup', {
	    successRedirect: '/profile',
	    failureFlash : true,
	    failureRedirect : '/signup'
	}));

	app.get('/profile', func.isLoggedIn, function(req, res){
	    res.redirect('/recent');
	});

	app.get('/logout', function(req, res){
	    req.logout();
	    res.redirect('/');
	});
};
