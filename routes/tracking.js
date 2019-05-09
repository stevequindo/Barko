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
            let trackingInfo = {};
            let status, sender, receiver;

            // Iterate over every tracking number
            for (let elem of trackingNumArray) {
                try {
                    trackingInfo[elem] = await databases.findStatusInfo(elem, surnameString);

                    // console.log(trackingInfo[elem]); // for testing

                    status = trackingInfo[elem].status.stage;

                    sender = trackingInfo[elem].sender.firstName + " " 
                        + trackingInfo[elem].sender.middleName + " "
                        + trackingInfo[elem].sender.lastName;

                    receiver = trackingInfo[elem].receiver.firstName + " " 
                        + trackingInfo[elem].receiver.middleName + " "
                        + trackingInfo[elem].receiver.lastName;

                } catch(err) {
                    trackingInfo[elem] = err;
                    continue;
                }
            }

            res.render("tracking/results", {
                trackingInfo: trackingInfo, 
                trackingNumber: req.body.trackingNumber,
                trackingSurname: req.body.surname,
                status: status,
                sender: sender,
                receiver: receiver,
                user: user
            });
        }

        parseStatus();
    });
};
