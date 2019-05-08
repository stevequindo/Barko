const func = require(__dirname + "/functions.js");

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

