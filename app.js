/***************** CONSTANTS *****************/
// File folder names
const serverFilesPath = "/server_files/";
const clientFilesPath = "/client_files/";

// Set up express
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

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
app.use(bodyParser.urlencoded({extended:true}));

// Use static files
app.use(express.static("public"));

// Express.js initialisations
app.set('view engine', 'ejs');


/***************** INDEX PAGE *****************/
app.get("/", (req, res) => {
    res.render("index");
});

/***************** OVERVIEW PAGE *****************/
app.get("/overview", (req,res) => {
    // Retrieve countries array
    let countryArray = databases.getCountries();
    let title = "Countries";

    res.render('overview/main', {contentArray: countryArray, title: title});
});

app.get('/overview/:country/companies', (req,res) => {
   let country = req.params.country;
   let title = `${country}: Companies`;

   let companiesArray = databases.getCompanies(country);

   res.render('overview/main', {contentArray: companiesArray, title: title});
});

app.get('/overview/:country/company/:company', (req, res) => {
   let company = req.params.company;
   let title = `${company}: Containers`;

   // https://medium.com/@rossbulat/using-promises-async-await-with-mongodb-613ed8243900

   databases.getContainers()
       .then((dbResponse) => {
            // Clean dbResponse into an array of transactions
            dbResponse = dbResponse[0].transaction;
            res.render('overview/table-container', {title: title, contentArray: dbResponse});
        })
       .catch((err) =>{
           console.log(err);
       })

});



/***************** UPLOAD PAGE *****************/
app.get("/upload", (req, res) => {
    res.render("upload/prompt");
});

app.post("/upload", (req, res) => {
    // Check if files were uploaded
    if (Object.keys(req.files).length == 0) {
        return console.error('400: No files were uploaded.');
    }

    // Retrieve file based on file ID
    let file = req.files[fileID];
    let pathName =  "." + serverFilesPath + file.name;

    // Move file to server_files and return pathname
    file.mv(pathName, (err) => {
        if (err) {
            res.render("upload/failure");
        }
    
        let jsonWorkbook = getJsonWorkbook(pathName);
        let summary = databases.parseJsonWorkbook(jsonWorkbook);
        res.render("upload/success");
    });
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
    // fucking source on how to do this bullshit jesus christ
    // https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/

    async function parseStatus() {
        let trackingStatus = {};
        // Iterate over every tracking number
        for (let elem of trackingNumArray) {
            try {
                trackingStatus[elem] = await databases.findStatus(elem);
            } catch(err) {
                trackingStatus[elem] = err;
                continue;
            }
        }
        res.render("tracking/results", {trackingTable: trackingStatus});
    }

    parseStatus();
});


/***************** ERROR *****************/
app.get("*", (req,res) => {
    res.send('Error 404: Page not found');
});


/***************** SERVER *****************/
app.listen(port, () => {
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
    let workbook = XLSX.readFile(pathName), sheetNames = workbook.SheetNames;
    let jsonWorkbook = {};

    // Iterate over every sheet
    for (let i = 0; i < sheetNames.length; i ++) {
        let sheet = workbook.Sheets[sheetNames[i]];

        jsonSheet = XLSX.utils.sheet_to_json(sheet);

        // Append to jsonWorkbook with key = sheetName and value = jsonSheet
        jsonWorkbook[sheetNames[i]] = jsonSheet;
    }

    return jsonWorkbook;
}