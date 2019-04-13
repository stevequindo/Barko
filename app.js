/***************** CONSTANTS/NODE SETUP *****************/
// File folder names
const serverFilesPath = "/server_files/";
const clientFilesPath = "/client_files/";

// Set up express
const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
app.set('view engine', 'ejs');
// File uploading
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// File processing
let fileID = "theFile";
let XLSX = require('xlsx');

// Database operations
const databases = require(__dirname + "/custom_node_modules/databases.js");

// Body parsing and text processing
const bodyParser = require("body-parser");
const _ = require('lodash');
app.use(bodyParser.urlencoded({
    extended:true,
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

var configDB = require('./custom_node_modules/database.js');

mongoose.connect(configDB.url);
require('./custom_node_modules/passport')(passport);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({resave: false, saveUninitialized: true, secret: 'secretsession' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// Use static files
app.use(express.static("public"));

// Express.js initialisations
app.set('view engine', 'ejs');

let e = require('datatables.net-editor-server');

let Editor = e.Editor;
let Field = e.Field;
let Validate = e.Validate;
let Format = e.Format;

/***************** INDEX PAGE *****************/
app.get("/index2", (req, res) => {
    res.render("index2");
});
/***************** OVERVIEW PAGE *****************/
app.get("/overview", (req,res) => {
    // https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
    let id = req.query.id;
    let comp = req.query.comp;

    let view = 'phillipines';

    // Determine what the user wants based on their var paths
    if (comp !== undefined) {
        // Company is defined -> Show the transactions for that company
        let title = `${comp}: Containers`;

        // https://medium.com/@rossbulat/using-promises-async-await-with-mongodb-613ed8243900
        databases.getContainers()
            .then((dbResponse) => {
                // Get response
                let dbTransactionsArr = dbResponse[0].transactions;
                dbTransactionsArr = JSON.stringify(dbTransactionsArr);
                console.log(dbTransactionsArr);
                res.render('overview/main', {title: title, contentArray: dbTransactionsArr, type:'transaction', link: req.originalUrl, view: view});
            })
            .catch((err) =>{
                console.log(err);
            });

    } else if (id !== undefined){
        // Country is defined -> Show the MANIFEST FILES FOR THE COMPANY
        let title = `${id}: Manifest Files`;

        let companiesArray = databases.getPhManifestFiles(id);
        res.render('overview/main', {contentArray: companiesArray, title: title, type: 'manifest', link: req.originalUrl, view: view});
    } else {
        // Show all countries
        let countryArray = databases.getCountries();
        let title = "Countries";
        res.render('overview/main', {contentArray: countryArray, title: title, type: 'country',link: req.originalUrl, view: view});
    };
});

app.post("/overview", async (req,res) => {
    // Get JSON data
    let updateEntriesArr = req.body;

    // Update the entries
    const resultsJSON = await databases.updateEntries(updateEntriesArr);

    res.send(JSON.stringify(resultsJSON));
});

/***************** FOREIGN PAGE *****************/
app.get('/foreign', (req, res) => {
    // https://stackabuse.com/get-query-strings-and-parameters-in-express-js
    let id = req.query.id;
    let comp = req.query.comp;

    if (comp !== undefined) {
        // Company is defined -> Show the transactions for that company
        // https://medium.com/@rossbulat/using-promises-async-await-with-mongodb-613ed8243900
        let title = `${comp}: Containers`;
        databases.getContainers()
            .then((dbResponse) => {
                // Get response
                let dbTransactionsArr = dbResponse[0].transactions;
                res.render('overview/main', {title: title, contentArray: dbTransactionsArr, type:'transaction', link: req.originalUrl, view: 'foreign'});
            })
            .catch((err) =>{
                console.log(err);
            });
    } else if (id !== undefined) {
        // Country is defined -> Show the companies for that country
        let title = `Your Manifest Files`;
        id = 'Spain';
        let companiesArray = databases.getForeignManifestFiles(id);
        res.render('overview/main', {contentArray: companiesArray, title: title, type: 'manifest', link: req.originalUrl, view: 'foreign'});
    } else {
        res.redirect("/foreign?id=main");
    }
});

/***************** UPLOAD PAGE *****************/
app.get("/upload", (req, res) => {
    res.render("upload/prompt");
});

app.post("/upload", (req, res) => {
    try {
        // Check if files were uploaded
        if (Object.keys(req.files).length == 0) {
            throw("No files were uploaded");
        }

        // Retrieve file based on file ID
        let file = req.files[fileID];
        let pathName =  "." + serverFilesPath + file.name;

        // Move file to server_files and return pathname
        file.mv(pathName, (err) => {
            if (err) {
                throw err;
            }

            let jsonWorkbook = getJsonWorkbook(pathName);
            let summary = databases.parseJsonWorkbook(jsonWorkbook);

            if (summary.containersAdded == 0) {
                res.render('upload/failure', {errorMessage: "File was empty"})
            }

            res.render("upload/success", {summary: summary});
        });
    } catch(e) {
        res.render('upload/failure', {errorMessage: e});
    }
});

/***************** TRACKING PAGE *****************/
app.get("/tracking", (req,res) => {
    res.render("tracking/prompt");
});

app.post("/tracking", (req,res) => {
    // Retrieve tracking number from form
    let trackingNumberString = req.body.trackingNumber;

    // Split the string by newline
    let trackingNumArray = _.split(trackingNumberString, "\r\n");
    
    // Split the string by comma
    function splitComma(elem) {
        return _.split(elem, ",");
    }
    
    trackingNumArray = _.flatMapDeep(trackingNumArray, splitComma);
    
    // Remove all spaces
    function removeSpace(elem) {
        return _.replace(elem, " ", "");
    }

    trackingNumArray = _.flatMapDeep(trackingNumArray, removeSpace);

    // Remove empty elements
    _.remove(trackingNumArray, (elem) => {return elem == ""});

    // Retrieve object with key = tracking num, value = status
    // https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/

    async function parseStatus() {
        let trackingStatus = {};
        let trackingSender = {};
        let trackingReceiver = {};

        // Iterate over every tracking number
        for (let elem of trackingNumArray) {
            try {
                trackingStatus[elem] = await databases.findStatus(elem);
                trackingSender[elem] = await databases.findSender(elem);
                trackingReceiver[elem] = await databases.findReceiver(elem);
            } catch(err) {
                trackingStatus[elem] = err;
                trackingSender[elem] = err;
                trackingReceiver[elem] = err;
                continue;
            }
        }
        res.render("tracking/results", {trackingTable: trackingStatus, trackingSender: trackingSender, trackingReceiver: trackingReceiver});
    }

    parseStatus();
});


/***************** ERROR *****************/
app.get("*", (req,res) => {
    res.send('Error 404: Page not found');
});


/***************** SERVER *****************/
let server = app.listen(port, () => {
    console.log(`Server initialised on port ${port}`);
});

/***************** FUNCTIONS *****************/
getJsonWorkbook = function(pathName) {
    /*
        Params:
            pathName: File path to the Excel spreadsheet
        Returns:
            jsonWorkbook: JSON with key as the individual sheet and value as the array containing the rows (as objects)
    */
    let workbook = XLSX.readFile(pathName);
    let sheetNames = workbook.SheetNames;
    let jsonWorkbook = {};

    // Iterate over every sheet
    for (let i = 0; i < sheetNames.length; i ++) {
        const sheet = workbook.Sheets[sheetNames[i]];
        const jsonSheet = XLSX.utils.sheet_to_json(sheet);

        // Append to jsonWorkbook with key = sheetName and value = jsonSheet
        jsonWorkbook[sheetNames[i]] = jsonSheet;
    }


    return jsonWorkbook;
}