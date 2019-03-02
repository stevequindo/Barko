/***************** CONSTANTS *****************/
// File folder names
const serverFilesPath = "/server_files/";
const clientFilesPath = "/client_files/";

// Set up express
const express = require("express");
const app = express();
const port = 3000;

// File uploading
const fileUpload = require("express-fileupload");
app.use(fileUpload());

// File processing
let fileID = "theFile";
let XLSX = require('xlsx');

// Database operations
const databases = require(__dirname + "/custom_node_modules/databases.js");

// Body parsing
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

/***************** EXPRESS INITIALISATION *****************/

// Using the EJS as the view engine
app.set('view engine', 'ejs');

// Use local resources
app.use(express.static("public"));

/***************** SUBMIT PAGE *****************/
app.get("/", (req, res) => {
    res.render("upload");
});

app.post("/", (req, res) => {
    // Check if no files were uploaded
    if (Object.keys(req.files).length == 0) {
        return console.error('400: No files were uploaded.');
    }

    // Retrieve file based on file ID
    let file = req.files[fileID];
    let pathName =  "." + serverFilesPath + file.name;

    // Move file to server_files and return pathname
    file.mv(pathName, (err) => {
        if (err) {
            console.error("Error: 500");
        }
    
        let jsonWorkbook = getJsonWorkbook(pathName);
        let summary = databases.parseJsonWorkbook(jsonWorkbook);
        res.send(summary);
    });
});

/***************** TRACKING PAGE *****************/
app.get("/tracking", (req,res) => { 
    res.render("trackingPrompt");
});

app.post("/tracking", (req,res) => {
    // Retrieve tracking number from form
    let trackingNumber = req.body.trackingNumber;
    
    databases.findStatus(trackingNumber)
        .then(
            function(result) {
                res.render("trackingSuccess", {statusMsg: result});
        }).catch(
            function(err){
                res.render("trackingFailure");
    });
    
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