
const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

// File processing
let XLSX = require('xlsx');
let fileID = "theFile";

// File folder names
const serverFilesPath = "/server_files/";
const clientFilesPath = "/client_files/";


module.exports = function(app) {

	app.get("/upload", func.isLoggedIn, (req, res) => {
	    let user = req.user.local.role;

	    if (user == "overseas")
	        res.redirect("/recent");

	    res.render("upload/prompt", {
	        user: user
	    });
	});

	app.post("/upload", func.isLoggedIn, (req, res) => {
	    let user = req.user.local.role;

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
	            let summary = databases.parseJsonWorkbook(jsonWorkbook, req.user);

	            if (summary.containersAdded === 0) {
	                res.render('upload/failure', {errorMessage: "File was empty", user: user})
	            }

	            res.render("upload/success", {summary: summary, user: user});
	        });
	    } catch(e) {
	        res.render('upload/failure', {errorMessage: e, user: user});
	    }
	});

};


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