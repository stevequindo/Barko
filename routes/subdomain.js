
module.exports = function(app) {
    
    app.get('/fasttraxx', function(req,res){
	    res.render('subdomains/fasttraxx.ejs', {message: req.flash('loginMessage')});
	});
};
