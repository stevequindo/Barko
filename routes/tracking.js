const _ = require('lodash');
const databases = require("../custom_node_modules/databases.js");
const func = require(__dirname + "/functions.js");

module.exports = function(app) {

    app.get("/tracking", func.isLoggedIn, (req,res) => {
        let user = req.user.local;
        res.render("tracking/prompt", {user: user}); // this tracking search view is for loggedin users only
    });

    app.post("/tracking",(req,res) => {
        // TODO: Refactor this ugly ass function

        // check if user is a logged in user, to restrict sidebar view appropriately for staff and overseas
        // otherwise this tracking page is still accessible without login, with nothing on the sidebar
        let user = req.isAuthenticated() ? req.user.local : "";
        
        let trackingNumberArray = getCleanArray(req.body.trackingNumber);
        let surnameArray = getCleanArray(req.body.surname);

        async function parseStatus() {
            let trackingInfo = {};
            let additionalFilesInfo = [];

            // Iterate over every tracking number
            for (let trackingNumber of trackingNumberArray) {
                for (let surname of surnameArray) {
                    try {

                        let results = await databases.findStatusInfo(trackingNumber, surname);

                        trackingInfo[trackingNumber] = results["containerLine"][0];
                        trackingInfo[trackingNumber].overseasAccess = results["overseasAccess"];

                        // console.log(trackingInfo[elem]); // for testing

                        const additionalFilesArray = trackingInfo[trackingNumber].status.additionalFiles;

                        for (let file of additionalFilesArray) {
                            additionalFilesInfo.push({
                                containerId : results._id.toString(),
                                fileId: file._id.toString(),
                                fileName: file.name
                            });
                        }

                        break; // breaks out of surnameArray loop to move on searching with next tracking number

                    } catch(err) {
                        trackingInfo[trackingNumber] = err;
                        continue;
                    }
                }
            }

            res.render("tracking/results", {
                trackingInfo: trackingInfo, 
                trackingNumber: req.body.trackingNumber,
                trackingSurname: req.body.surname,
                additionalFilesInfo: additionalFilesInfo,
                user: user
            });
        }

        parseStatus();
    });
};

// Split the string by comma
function splitComma(str) { return _.split(str, ","); }

// Remove all spaces
function removeSpace(str) { return _.replace(str, " ", ""); }

// Function that returns clean set of array from string
function getCleanArray(str) {

    let temp_str = str;

    // Trim white spaces from front and back & Split string by newline
    let str_array = _.split(str.trim(), "\r\n");
    
    // Split the string by comma
    str_array = _.flatMapDeep(str_array, splitComma);
    
    // Remove all spaces
    str_array = _.flatMapDeep(str_array, removeSpace);

    // Remove empty elements
    _.remove(str_array, (str) => { return str == "" });

    return str_array;
}
