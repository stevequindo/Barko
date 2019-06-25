const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {
    app.get('/overview', func.isLoggedIn, async (req, res) => {
        let user = req.user.local;

        try {
            if (user.role === "staff") {
                // Show all countries
                const countryArray = await databases.getCountries(req.user);

                // Redirect away if no containers
                if (countryArray.length === 0) {
                    throw new TypeError();
                }

                res.render('overview/countries', {contentArray: countryArray, user: user});

            } else if (user.role === "overseas") {
                // Show all manifest files
                const manifestArray = await databases.getContainersByUser(req.user);

                // Redirect away if no containers
                if (manifestArray.length === 0) {
                    throw new TypeError();
                }

                res.render('overview/containers-overseas', {contentArray: manifestArray, user: user});
            }
        } catch (err) {
            let mHeader, mBody;
            if (err instanceof TypeError) {
                console.error(`Error found: ${err}\nPossibly no files found.`);

                res.render("error/no-files", {
                    user: user
                });
            } else {
                res.render("error/message", {
                    user: user,
                    messageHeader: "It appears an unknown error has occurred.",
                    messageBody: `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message <strong>${err}</strong>`,
                });
            }
        }
    });

    app.get("/overview/country/:country", func.isLoggedIn, async (req,res) => {
        let user = req.user.local;

        try {
            // Country is defined -> Show the manifest files for that country
            let country = decodeURIComponent(req.params.country.toLowerCase());
            let containerArray = await databases.getContainers(country, req.user);

            // Redirect away if no containers
            if (containerArray.length === 0) {
                throw new TypeError();
            }

            // Render the container files
            res.render('overview/containers', {contentArray: containerArray, country: country, user: user});
        } catch (err) {
            let mHeader, mBody;
            if (err instanceof TypeError) {
                res.render("error/no-files", {
                    user: user
                });
            } else {
                res.render("error/message", {
                    user: user,
                    messageHeader: "It appears an unknown error has occurred.",
                    messageBody: `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message <strong>${err}</strong>`,
                });
            }
        }
    });

    app.get("/overview/id/:id", func.isLoggedIn, (req,res) => {
        let user = req.user.local;
        const country =  decodeURIComponent(req.params.country);
        const id = decodeURIComponent(req.params.id);

        databases.getContainerLines(id, req.user)
            .then((dbResponse) => {

                // Get response
                let containerNo;
                if (!dbResponse._doc.hasOwnProperty("containerNo")) {
                    containerNo = "Container";
                } else {
                    containerNo = `Container Number: ${dbResponse["containerNo"]}`;
                }

                let transactionsArray = JSON.stringify(dbResponse["containerLine"]);
                res.render('overview/containerLines', {
                    contentArray: transactionsArray,
                    containerNo: containerNo,
                    country: country,
                    id: id,
                    user: user
                });
            })
            .catch((err) => {
                let mHeader, mBody;

                if (err instanceof TypeError) {
                    res.render("error/no-files", {
                        user: user
                    });
                } else {
                    res.render("error/message", {
                        user: user,
                        messageHeader: "It appears an unknown error has occurred.",
                        messageBody: `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message <strong>${err}</strong>`,
                    });
                }
            });
    });

    app.post("/overview/id/:id/file", func.isLoggedIn, async (req, res) => {
        const user = req.user.local;
        const id = req.params.id;
        let rowIds = req.body.rowId.split(",");

        // Slice off the # for the rows
        for (let i = 0; i < rowIds.length; i++) {
            rowIds[i] = rowIds[i].slice(1);
        }

        // Check if files were uploaded
        if (Object.keys(req.files).length === 0) throw "No files were uploaded";

        // Get object containing results to be sent back to data-tables
        const resultsObj = await databases.uploadFile(id, req.files.upload, rowIds);

        // Return as JSON
        res.contentType('application/json');
        res.send(resultsObj);
    });

    app.get('/overview/id/:id/file/:fileId', async (req, res) => {
		const containerId = req.params.id;
		const fileId = req.params.fileId;

		const fileObj = await databases.getFileObjById(containerId, fileId);

		console.log(fileObj);
		// Send file to client
		res.writeHead(200, {
			'Content-Type': fileObj.mimetype,
			'Content-Disposition': `attachment; filename=${fileObj.name}`,
			'Content-Length': fileObj.size
		});
		res.end(fileObj.data);

	});


    app.post("/overview/id/:id", func.isLoggedIn, async (req,res) => {
        const user = req.user.local;
        const id = req.params.id;

        // Get JSON data
        const updateEntriesArr = req.body;

        // Update the entries
        const resultsJSON = await databases.updateEntries(updateEntriesArr, req.user, id);

        res.send(JSON.stringify(resultsJSON));
    });

    app.get("/overview/id/:id/settings", func.isLoggedIn, async (req, res) => {
        const user = req.user.local;
        const id = decodeURIComponent(req.params.id);

        try {
            const container = await databases.getContainerSettings(id, req.user);

            if (container == null || container === undefined) throw new Error("File not found");

            res.render("overview/manifest-settings", {
                user: user,
                id: id,
                container: container
            });
        } catch(error) {
            res.render("error/message", {
                user: user,
                messageHeader: "It appears an unknown error has occurred.",
                messageBody: `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message <strong>${err}</strong>`,
            });
        }
    });

    app.post('/overview/id/:id/settings', func.isLoggedIn, (req,res) => {
        const country = decodeURIComponent(req.params.country);
        const id = decodeURIComponent(req.params.id);

        databases.updateContainerSettings(id, req.body, req.user)
            .then(ans => {
                const response = {
                    updateSuccess: true
                };
                res.send(response);
            })
            .catch(err => {
                const response = {
                    updateSuccess: false,
                    message: err
                };
                res.send(response);
            });
    });
};

