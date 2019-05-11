const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {
    app.get('/overview', func.isLoggedIn, async (req, res) => {
        let user = req.user.local.role;

        try {
            if (user === "staff") {
                // Show all countries
                const countryArray = await databases.getCountries(req.user);

                // Redirect away if no containers
                if (countryArray.length === 0) {
                    throw new TypeError();
                }

                res.render('overview/countries', {contentArray: countryArray, user: user});
            } else if (user === "overseas") {
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

                // Occurs if nothing is no transactions are found
                mHeader = "It appears no files have been uploaded yet.";
                mBody = `Please try again later or contact us <a href='mailto:nchong128@gmail.com' style="color: black">here</a>`;
            } else {
                mHeader = "It appears an unknown error has occurred.";
                mBody = `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message <strong>${err}</strong>`;
            }

            res.render("error/message", {
                user: user,
                messageHeader: mHeader,
                messageBody: mBody,
            });
        }
    });

    app.get("/overview/country/:country", func.isLoggedIn, async (req,res) => {
        let user = req.user.local.role;

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
                // Occurs if nothing is no transactions are found
                mHeader = "It appears no files have been uploaded yet.";
                mBody = `Please try again later or contact us <a href='mailto:nchong128@gmail.com' style="color: black">here</a>`;
            } else {
                mHeader = "It appears an unknown error has occurred.";
                mBody = `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message ${err}`;
            }

            res.render("error/message", {
                user: user,
                messageHeader: mHeader,
                messageBody: mBody,
            });
        }
    });

    app.get("/overview/country/:country/id/:id", func.isLoggedIn, (req,res) => {
        let user = req.user.local.role;
        const country =  decodeURIComponent(req.params.country);
        const id = decodeURIComponent(req.params.id);

        databases.getContainerLines(id, req.user)
            .then((dbResponse) => {
                // Get response
                let transactionsArray = JSON.stringify(dbResponse["containerLine"]);
                res.render('overview/containerLines', {
                    contentArray: transactionsArray,
                    country: country,
                    id: id,
                    user: user
                });
            })
            .catch((err) => {
                let mHeader, mBody;

                if (err instanceof TypeError) {
                    // Occurs if nothing is no transactions are found
                    mHeader = "It appears no files have been uploaded yet.";
                    mBody = `Please try again later or contact us <a href='mailto:nchong128@gmail.com' style="color: black">here</a>`;
                } else {
                    mHeader = "It appears an unknown error has occurred.";
                    mBody = `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message ${err}`;
                }
                res.render("error/message", {
                    messageHeader: mHeader,
                    messageBody: mBody,
                    user: user
                });
            });
    });

    app.get("/overview/country/:country/id/:id/settings", func.isLoggedIn, async (req, res) => {
        const user = req.user.local.role;
        const country = decodeURIComponent(req.params.country);
        const id = decodeURIComponent(req.params.id);

        try {
            const container = await databases.getContainerSettings(id, req.user);

            if (container == null && container === undefined) throw Error("File not found");

            res.render("overview/manifest-settings", {
                user: user,
                country: country,
                id: id,
                container: container
            });
        } catch(error) {
            const mHeader = "It appears you do not have access to this file or this file does not exist.";
            const mBody = `Please try again later or contact us <a href='mailto:nchong128@gmail.com' style="color: black">here</a>`;
            res.render("error/message", {
                user: user,
                messageHeader: mHeader,
                messageBody: mBody,
            });
        }
    });

    app.post('/overview/country/:country/id/:id/settings', func.isLoggedIn, (req,res) => {
        const country = decodeURIComponent(req.params.country);
        const id = decodeURIComponent(req.params.id);

        console.log(req.body);

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
            })

    });

    app.post("/overview/update", func.isLoggedIn, async (req,res) => {
        let user = req.user.local.role;
        const containerId =  req.headers["containerid"];

        // Get JSON data
        let updateEntriesArr = req.body;

        // Update the entries
        const resultsJSON = await databases.updateEntries(updateEntriesArr, req.user, containerId);

        res.send(JSON.stringify(resultsJSON));
    });
};

