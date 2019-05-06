
const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {

    app.get('/recent', func.isLoggedIn, async (req,res) => {
        let user = req.user.local.role;
        try {
            let results = await databases.getLatestTransactionInfo();

            res.redirect(`/overview/country/${results.departureCountry}/id/${results._id}`);
        } catch(e) {
            let mHeader, mBody;
            if (e instanceof TypeError) {
                // Occurs if nothing is no transactions are found
                mHeader = "It appears no files have been uploaded yet.";
                mBody = `Please try again later or contact us <a href='mailto:nchong128@gmail.com' style="color: black">here</a>`;
            } else {
                mHeader = "It appears an unknown error has occured.";
                mBody = `Please contact us <a href='mailto:nchong128@gmail.com'>here</a> giving us the error message ${e}`;
            }

            res.render("error/message", {
                user: user,
                messageHeader: mHeader,
                messageBody: mBody,
            });
        }
    });
};
