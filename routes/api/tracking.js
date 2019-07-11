const _ = require('lodash');
const databases = require("../../models/databases.js");
const express = require("express");
const router = express.Router();

// @route GET api/tracking
// @desc
// @access Public
router.get("/", async (req, res) => {
    // cleans input req string and parses to array
    let trackingNumberArray = getCleanArray(req.query.trackingNumber);
    let surnameArray = getCleanArray(req.query.surname);

    let trackingInfo = {};

    // Iterate over every tracking number & surname to find status info in database
    for (let trackingNumber of trackingNumberArray) {
        for (let surname of surnameArray) {
            try {
                let results = await databases.findStatusInfo(trackingNumber, surname);

                trackingInfo[trackingNumber] = results["containerLine"][0];
                trackingInfo[trackingNumber].containerId = results._id.toString();
                trackingInfo[trackingNumber].files = [];

                const additionalFilesArray = trackingInfo[trackingNumber].status.additionalFiles;

                for (let file of additionalFilesArray) {
                    trackingInfo[trackingNumber].files.push({
                        containerId : results._id.toString(),
                        fileId: file._id.toString(),
                        fileName: file.name
                    });
                }

                break; // breaks out of surnameArray loop to move on searching with next tracking number

            } catch (err) {
                trackingInfo[trackingNumber] = err;
            }
        }
    }

    let trackingResults = [];

    // build json for response
    for (let item in trackingInfo) {
        trackingResults.push({
            trackingNumber: item,
            sender: nameBuilder(trackingInfo[item].sender.firstName,
                trackingInfo[item].sender.middleName,
                trackingInfo[item].sender.lastName),
            receiver: nameBuilder(trackingInfo[item].receiver.firstName,
                trackingInfo[item].receiver.middleName,
                trackingInfo[item].receiver.lastName),
            stage: trackingInfo[item].status.stage,
            eta: getETA(trackingInfo[item].status),
            containerId: trackingInfo[item].containerId,
            files: trackingInfo[item].files,
        });
    }

    res.json({trackingResults: trackingResults});
});

// Split the string by comma
function splitComma(str) { return _.split(str, ","); }

// Remove all spaces
function removeSpace(str) { return _.replace(str, " ", ""); }

// Function that returns clean set of array from string
function getCleanArray(str) {
    // Trim white spaces from front and back & Split string by newline
    let str_array = _.split(_.trim(str), "\r\n");
    
    // Split the string by comma
    str_array = _.flatMapDeep(str_array, splitComma);
    
    // Remove all spaces
    str_array = _.flatMapDeep(str_array, removeSpace);

    // Remove empty elements
    _.remove(str_array, (str) => { return str === "" });

    return str_array;
}

// function that return sender & receiver full name correctly
function nameBuilder(firstName, middleName, lastName) {
    let fullName = "";

    if (middleName !== undefined || middleName === "") {
        fullName = firstName + " " + middleName + " " + lastName;
    } else {
        fullName = firstName + " " + lastName;
    }

    return fullName;
}

// Constructs an appropriate ETA message given the status of an order
function getETA(status) {
    let statusMessage = "";
    let stages = [
      "At Departing Port", 
      "On Transit", 
      "At Destination Port", 
      "At Customs", 
      "For Dispatch", 
      "For Delivery",
      "Delivered"
    ];

    // find index of stage in stages
    let index = stages.indexOf(status.stage);

    if (index === 0 || index === 1) {
        if (status.estPortArrivalDate) {
            let estPortArrivalDate = new Date(status.estPortArrivalDate);

            statusMessage = "Estimated date to destination port: "
                + estPortArrivalDate.getDate() + "-"
                + (estPortArrivalDate.getMonth()+1) + "-"
                + estPortArrivalDate.getFullYear();
        }
    } else if (index > 1 && index < 6) {
        if (status.estDeliveryDate) {
            let estDeliveryDate = new Date(status.estDeliveryDate);

            statusMessage = "Estimated date to delivery: "
                + estDeliveryDate.getDate() + "-"
                + (estDeliveryDate.getMonth()+1) + "-"
                + estDeliveryDate.getFullYear();
        }
    } else {
            if(status.receivedBy) {
                statusMessage = "Delivered and received by " + status.receivedBy;
            } else {
                statusMessage = "Delivered"
            }
    }

    return statusMessage;
}

module.exports = router;