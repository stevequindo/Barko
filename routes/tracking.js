const _ = require('lodash');
const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {

    app.get("/tracking", func.isLoggedIn, (req,res) => {
        let user = req.user.local.role;
        res.render("tracking/prompt", {user: user}); // this tracking search view is for loggedin users only
    });

    app.post("/tracking", (req,res) => {

        let user = "";
        // check if user is a logged in user, to restrict sidebar view approperiately for staff and overseas
        if(req.isAuthenticated()) {
            user = req.user.local.role;
        } 
        // otherwise this tracking page is still accessible without login, with nothing on the sidebar

        // Retrieve tracking number & surname from form
        let trackingNumberString = req.body.trackingNumber;
        let surnameString = req.body.surname;

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
                    trackingStatus[elem] = await databases.findStatusNew(elem, surnameString);
                    // trackingSender[elem] = await databases.findSender(elem);
                    // trackingReceiver[elem] = await databases.findReceiver(elem);

                    console.log(elem + ". Tracking Status[elem]: " + trackingStatus[elem]); // for testing

                } catch(err) {
                    trackingStatus[elem] = err;
                    // trackingSender[elem] = err;
                    // trackingReceiver[elem] = err;
                    continue;
                }
            }

            res.render("tracking/results", {
                trackingTable: trackingStatus, 
                // trackingSender: trackingSender, 
                // trackingReceiver: trackingReceiver,
                // trackingNum: req.body.trackingNumber,
                user: user
            });
        }

        parseStatus();
    });
};
