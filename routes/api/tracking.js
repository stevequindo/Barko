const _ = require('lodash');
const express = require("express");
const router = express.Router();
const databases = require('../../db/databases');

// @route POST api/tracking
// @desc Provides tracking info based on given tracking numbers and surnames of the sender
// @access Public
router.post("/", async (req, res) => {
    // cleans input req string and parses to array
    let trackingNumberArray = getCleanArray(req.body.trackingNumber);
    let surnameArray = getCleanArray(req.body.surname);

    let trackingInfo = [];

    // Iterate over every tracking number & surname to find status info in database
    for (let trackingNumber of trackingNumberArray) {
        for (let surname of surnameArray) {
            let container = await databases.findStatusInfo(trackingNumber, surname);
            let errors = {};
            let results = {};

            if (container !== null)  {
                let containerLine = container["containerLine"][0];

                results = {
                    containerId: container._id.toString(),
                    trackingNumber: containerLine.trackingNo,
                    sender: nameBuilder(containerLine.sender.firstName, containerLine.sender.middleName, containerLine.sender.lastName),
                    receiver: nameBuilder(containerLine.receiver.firstName, containerLine.receiver.middleName, containerLine.receiver.lastName),
                    stage: containerLine.status.stage,
                    eta: getETA(containerLine.status),
                    files: []
                };

                // Place in file info
                const additionalFilesArray = containerLine.status.additionalFiles;
                for (let file of additionalFilesArray) {
                    results.files.push({
                        containerId: results.containerId,
                        fileId: file._id.toString(),
                        fileName: file.name
                    });
                }
            } else {
                errors = {
                    containernotfound: "Container is not found"
                };
            }

            // Place all info
            trackingInfo.push({
                errors,
                results
            });

            break;
        }
    }

    res.json(trackingInfo);
});

// Split the string by comma
function splitComma(str) { return _.split(str, ","); }

// Remove all spaces
function removeSpace(str) { return _.replace(str, " ", ""); }

// Function that returns clean set of array from string
function getCleanArray(str) {
    // Trim white spaces from front and back & split string by newline
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