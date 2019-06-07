/***************** CONSTANTS/NODE SETUP *****************/
// Set up express
const express = require("express");
const app = express();
const port = process.env.PORT || 3050;

// Use static files
app.use(express.static("public"));

// Express.js initialisations
app.set('view engine', 'ejs');

// Database operations
const databases = require(__dirname + "/custom_node_modules/databases.js");

// Body parsing and text processing
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended : true,
    useNewUrlParser : true
}));
app.use(bodyParser.json());

// For Login Authentication
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({resave: false, saveUninitialized: true, secret: 'secretsession' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./custom_node_modules/passport')(passport);

/***************** LOGIN PAGE *****************/
require(__dirname + '/routes/login.js')(app, passport);

/***************** OVERVIEW PAGE *****************/
require(__dirname + '/routes/overview.js')(app);

/***************** RECENT PAGE *****************/
require(__dirname + '/routes/recent.js')(app);

/***************** UPLOAD PAGE *****************/
// File uploading
const fileUpload = require("express-fileupload");
app.use(fileUpload());

require(__dirname + '/routes/upload.js')(app);

/***************** TRACKING PAGE *****************/
require(__dirname + '/routes/tracking.js')(app);

/***************** SUBDOMAIN PAGE *****************/
require(__dirname + '/routes/subdomain.js')(app);


/***************** ERROR *****************/
app.get("*", (req,res) => {
    res.send('Error 404: Page not found');
});

/***************** SERVER *****************/
let server = app.listen(port, () => {
    console.log(`Server initialised on port ${port}`);
});
