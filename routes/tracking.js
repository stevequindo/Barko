const _ = require('lodash');
const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {

    app.get("/tracking", func.isLoggedIn, (req,res) => {
        let user = req.user.local;
        res.render("tracking/prompt", {user: user}); // this tracking search view is for loggedin users only
    });

    app.post("/tracking", (req,res) => {

        let user = "";
        // check if user is a logged in user, to restrict sidebar view appropriately for staff and overseas
        if(req.isAuthenticated()) {
            user = req.user.local;
        } 
        // otherwise this tracking page is still accessible without login, with nothing on the sidebar

        // Retrieve tracking number & surname from form
        let trackingNumberString = req.body.trackingNumber.trim();
        let surnameString = req.body.surname.trim();

        // Split the string by newline
        let trackingNumArray = _.split(trackingNumberString, "\r\n");
        let surnameArray = _.split(surnameString, "\r\n");
        
        // Split the string by comma
        function splitComma(elem) {
            return _.split(elem, ",");
        }
        
        trackingNumArray = _.flatMapDeep(trackingNumArray, splitComma);
        surnameArray = _.flatMapDeep(surnameArray, splitComma);
        
        // Remove all spaces
        function removeSpace(elem) {
            return _.replace(elem, " ", "");
        }

        trackingNumArray = _.flatMapDeep(trackingNumArray, removeSpace);
        surnameArray = _.flatMapDeep(surnameArray, removeSpace);

        // Remove empty elements
        _.remove(trackingNumArray, (elem) => {return elem == ""});
        _.remove(surnameArray, (elem) => {return elem == ""});

        // Retrieve object with key = tracking num, value = status
        // https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/

        async function parseStatus() {
            let trackingInfo = {};
            let status, sender, receiver, eta;

            // Iterate over every tracking number
            for (let elem of trackingNumArray) {
                for (let s of surnameArray) {
                    try {
                        let results = await databases.findStatusInfo(elem, s);
                        trackingInfo[elem] = results["containerLine"][0];
                        trackingInfo[elem].overseasAccess = results["overseasAccess"];

                        console.log(trackingInfo[elem]); // for testing

                        sender = trackingInfo[elem].sender.firstName + " " 
                            + trackingInfo[elem].sender.middleName + " "
                            + trackingInfo[elem].sender.lastName;

                        receiver = trackingInfo[elem].receiver.firstName + " " 
                            + trackingInfo[elem].receiver.middleName + " "
                            + trackingInfo[elem].receiver.lastName;

                        status = trackingInfo[elem].status.stage;
                        eta = trackingInfo[elem].status.estPortArrivalDate;

                        break; // breaks out pf surnameArray loop to move on searching with next tracking number

                    } catch(err) {
                        trackingInfo[elem] = err;
                        continue;
                    }
                }
            }

            res.render("tracking/results", {
                trackingInfo: trackingInfo, 
                trackingNumber: req.body.trackingNumber,
                trackingSurname: req.body.surname,
                sender: sender,
                receiver: receiver,
                status: status,
                eta: eta,
                user: user
            });
        }

        parseStatus();
    });
};
