// File folder names
const serverFilesPath = "/server_files/";
const clientFilesPath = "/client_files/";

// NPM modules
const express = require("express");
const fileUpload = require("express-fileupload");
const databases = require(__dirname + "/databases.js");

const app = express();
const port = 3000;

app.use(fileUpload());

// Using the EJS as the view engine
app.set('view engine', 'ejs');

// // Use local resources
// app.use(express.static("public"));

// SUBMIT PAGE
app.get("/", (req, res) => {
    res.render("upload");
});

app.post("/", (req, res) => {
    // Check if no files were uploaded
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Retrieve file
    let file = req.files.theFile;
    let pathName = __dirname + serverFilesPath + file.name;

    // Move file to /files
    file.mv(pathName, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        databases.parseNewFile(pathName);
        res.send("File uploaded and parsed!");

    });
});

// BEGIN LISTENING
app.listen(port, () => {
    console.log(`Server initialised on port ${port}`);
});