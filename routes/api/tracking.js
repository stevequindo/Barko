const _ = require('lodash');
const databases = require("../../models/databases.js");


module.exports = function(app) {
    app.post("/tracking",(req,res) => {

        // cleans input req string and parses to array
        let trackingNumberArray = getCleanArray(req.body.trackingNumber);
        let surnameArray = getCleanArray(req.body.surname);

        async function parseStatus() {
            let trackingInfo = [];
            let additionalFilesInfo = [];
            let additionalFilesArray

            // Iterate over every tracking number & surname to find status info in database
            for (let trackingNumber of trackingNumberArray) {
                for (let surname of surnameArray) {
                    try {

                        let results = await databases.findStatusInfo(trackingNumber, surname);

                        console.log(results);
                        trackingInfo[trackingNumber] = results["containerLine"][0];
                        trackingInfo[trackingNumber].overseasAccess = results["overseasAccess"];
                        trackingInfo[trackingNumber].containerId = results._id.toString();

                        break; // breaks out of surnameArray loop to move on searching with next tracking number

                    } catch(err) {
                        trackingInfo[trackingNumber] = err;
                        continue;
                    }
                }
            }

            let trackingResults = [];
            let resultsArray = trackingInfo;

            // build json for response
            for(let item in resultsArray) {

                trackingResults.push({
                    trackingNumber : item,
                    sender: nameBuilder(resultsArray[item].sender.firstName, 
                        resultsArray[item].sender.middleName, 
                        resultsArray[item].sender.lastName),
                    receiver: nameBuilder(resultsArray[item].receiver.firstName, 
                        resultsArray[item].receiver.middleName, 
                        resultsArray[item].receiver.lastName),
                    status: resultsArray[item].status.stage,
                    eta: getETA(resultsArray[item].status.stage, resultsArray[item].status),
                    companyId: resultsArray[item].overseasAccess,
                    files: resultsArray[item].status,
                    containerId: resultsArray[item].containerId
                });
            }

            res.json({ trackingResults: trackingResults });
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

// function that return sender & receiver full name correctly
function nameBuilder(firstName, middleName, lastName) {
    let fullName = "";

    if(middleName != undefined || middleName == "") {
        fullName = firstName + " " + middleName + " " + lastName;

    } else {
        fullName = firstName + " " + lastName;
    }
    return fullName;
}

// function to get appropriate ETA
function getETA(status, eta) {

    let status_msg = "";
    let stages = [
      "At Departing Port", 
      "On Transit", 
      "At Destination Port", 
      "At Customs", 
      "For Dispatch", 
      "For Delivery",
      "Delivered"
    ];

    for (let i = 0; i < stages.length; i++) {
      if(status.toUpperCase() === stages[i].toUpperCase()) {

        if(i === 0 || i === 1) {
            if(eta.estPortArrivalDate) {
                let estPortArrivalDate = new Date(eta.estPortArrivalDate);

                status_msg = "Estimated date to destination port: " 
                    + estPortArrivalDate.getDate() + "-" 
                    + (estPortArrivalDate.getMonth()+1) + "-" 
                    + estPortArrivalDate.getFullYear();
            }

        } else if (i === 2 || i === 3 || i === 4 || i === 5) {

            if(eta.estDeliveryDate) {
                let estDeliveryDate = new Date(eta.estDeliveryDate);

                status_msg = "Estimated date to delivery: " 
                    + estDeliveryDate.getDate() + "-" 
                    + (estDeliveryDate.getMonth()+1) + "-" 
                    + estDeliveryDate.getFullYear();
            }

        } else if (i === 6) {
            if(eta.receivedBy) {
                status_msg = "Delivered and received by " + eta.receivedBy;
            } else {
                status_msg = "Delivered"
            }
        }
      } 
    } // End of for loop

    return status_msg;

} // End of getETA() function

