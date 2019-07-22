
/***************** CONSTANTS AND NODE REQS*****************/
const mongoose = require('mongoose');

// Connection URL
// const url = 'mongodb+srv://nchong128:apple123@cluster0-7jrih.mongodb.net';
// const databaseName = "balikbayanDB";
// mongoose.connect(`${url}/${databaseName}`, {
// 	useNewUrlParser: true,
// 	useFindAndModify: false
// });

// Flags
let flags = require('country-flags-svg');
let _ = require('lodash');

// Import models
const schema = require("./models/dbSchema");
const Container = schema.Container;
const ContainerLine = schema.ContainerLine;
const File = schema.File;
const User = require('./models/users');

/***************** FUNCTIONS *****************/
exports.parseJsonWorkbook = async function(jsonWorkbook, userData, userType, containerNum) {
	/*
	This function processes a spreadsheet's contents and uploads it into the database

	Error Handling:
		- Skips over empty sheets

		- TODO: Adjust error handling for when sender/receiver has no last name or first name
	Params:
		jsonWorkbook: Object containing sheet info to be processed
	Returns:
		Object containing statistics about the process
	*/

	// First checks if container number is already used
	await Container.findOne(
		{
			containerNo: containerNum,
			$or: [
				{overseasAccess: userData._id},
				{localAccess: userData._id}
			]
		},
		(err, res) => {
			if (res){
				console.error(`Found duplicate container number`);
				return new Error("Existing match");
			}
		});

	// summary object for statistics
	let summary = {
		containerNo: containerNum,
		containersAdded: 0,
		sendersAdded: 0,
		receiversAdded: 0,
		transactionsAdded:0,
		emptySheets: 0,
	};

	// Iterate over every sheet in the excel file
	for (let sheet in jsonWorkbook) {
		// Obtain array of spreadsheet rows
		let arrayOfRows = jsonWorkbook[sheet];

		// Update statistics
		if (arrayOfRows.length === 0) {
			console.log(`Sheet ${sheet} is empty. Skipping...`);
			summary.emptySheets ++;
			continue;
		} else {
			console.log(`Sheet ${sheet} is being processed...`);
			summary.containersAdded ++;
		}

		// Iterate over every row
		let transactionArray = [];

		// Create container
		let container = new Container({
			_id: new mongoose.Types.ObjectId(),
			dateAdded: new Date(),
			dateLastAccessed: new Date(),
			containerLine: [],
			containerNo: containerNum
		});

		// Add access based on uploader's role
		if (userData.local.role === "overseas") {
			container.overseasAccess = userData._id;

		} else if (userData.local.role === "staff") { //TODO: Change to "local" when doing whole refactor
			container.localAccess = userData._id;
		}

		// Iterate over every row (besides the header row)
		for (let i = 0; i < arrayOfRows.length; i++) {
			let row = arrayOfRows[i];

			// Get departure and arrival country based on first row
			if (i === 0) {
				container.departureCountry = row["Country"];
				container.targetCountry = row["Country_1"];
			}

			// Create ContainerLine object
			let containerLine = new ContainerLine({
				_id: new mongoose.Types.ObjectId(),
				count: row["Count"],
				batchNo: row["Batch No."],
				trackingNo: row["Tracking No."],
				status: {
					stage: "At Departing Port"
				},
				sender: {
					lastName: row["Last Name"],
					firstName: row["First Name"],
					middleName: row["Middle Name"],
					area: row["Area"],
					country: row["Country"],
					contactNo: row["Contact Number(s)"]
				},
				receiver: {
					lastName: row["Last Name_1"],
					firstName: row["First Name_1"],
					middleName: row["Middle Name_1"],
					address: row["Address"],
					city: row["City"],
					province: row["Province"],
					country: row["Country_1"],
					contactNo: row["Contact Number(s)_1"]
				}
			});

			// Add ContainerLine instance to Container instance
			container.containerLine.push(containerLine);

			// Increment counts
			summary.sendersAdded++; summary.transactionsAdded++; summary.receiversAdded++;
		}

		// Save user access
		await User.findOneAndUpdate({_id: userData._id}, {$push: {"local.access": container._id}}, {"upsert": true});

		// Save container
		container.save();
	}

	return summary;
};

exports.findStatusInfo = function(trackingNum, Surname) {
	/**
	 * This function finds the status information given a tracking number and the SENDER's surname
	 *
	 * Params:
	 * 	- trackingNum (String) representing the tracking number
	 * 	- Surname (String) representing the surname of the sender
	 * Returns:
	 *  - Promise containing an object of the specific container line
	 */
	return new Promise((resolve, reject) => {
		let lastName = '^'+Surname+'$';
		let trackingNumber = '^'+trackingNum+'$';

		Container
			.findOne({
					'containerLine': {
						$elemMatch: {
							'trackingNo': {
								'$regex': trackingNumber, $options:'i'
							},
							'sender.lastName': {
								'$regex': lastName, $options:'i'
							}
						}
					}},
				{
					'containerLine': {
						$elemMatch: {
							'trackingNo': {
								'$regex': trackingNumber, $options:'i'
							},
							'sender.lastName': {
								'$regex': lastName, $options:'i'
							}
						}
					},
					'overseasAccess' : 1
				})
			.populate('containerLine[0].sender containerLine[0].receiver containerLine[0].status')
			.exec((err, docs) => {
				if (docs !== null && docs !== undefined)  {
					resolve(docs);
				} else {
					reject("No results returned");
				}
			});
	});
};

exports.getCountries = function(userData) {
	// Get all the countries associated with the given user and aggregate into different countries
	return new Promise((resolve, reject) => {
		if (userData.local.role === "staff") {
			Container.aggregate()
				.match({localAccess: userData._id})
				.project("departureCountry")
				.group({_id: "$departureCountry",  numOfContainers: {$sum : 1}})
				.exec((err, doc) => {
					if (err) reject(err);
					doc.forEach((item) => {
						item.flagUrl = flags.findFlagUrlByCountryName(item._id);
					});
					resolve(doc);
				});
		} else if (userData.local.role === "overseas") {
			Container.aggregate()
				.match({localAccess: userData._id})
				.project("targetCountry")
				.group({_id: "$targetCountry",  numOfContainers: {$sum : 1}})
				.exec((err, doc) => {
					if (err) reject(err);
					doc.forEach((item) => {
						item.flagUrl = flags.findFlagUrlByCountryName(item._id);
					});
					resolve(doc);
				});
		}
	});
};

exports.getContainers = async (country, userData) => {
	/*
	This function retrieves all of the containers for a given country.

	Params: None
	Return: Promise containing the transactions in the resolution
	 */
	if (userData.local.role === "staff") {
		let docs = await Container.aggregate()
			.match({
				departureCountry: {$regex: new RegExp('^' + country, 'i')},
				localAccess: userData._id
			})
			.project({
				dateAdded: 1,
				overseasAccess: 1,
				containerNo: 1
			});

		for (let i  = 0; i < docs.length; i ++) {
			if (docs[i].hasOwnProperty("overseasAccess")) {
				let user = await User.findOne({_id: docs[i].overseasAccess}, '', {});
				docs[i].name = user.local.email;
			} else {
				docs[i].name = "Unknown";
			}
		}
		return docs;
	}
};

exports.getContainersByUser = async (userData) => {
	if (userData.local.role === "overseas") {
		let docs = await Container.aggregate()
			.match({
				overseasAccess: userData._id
			})
			.project({
				dateAdded: 1,
				localAccess: 1
			});

		for (let i = 0; i < docs.length; i ++) {
			if (docs[i].hasOwnProperty("localAccess")) {
				let user = await User.findOne({_id: docs[i].localAccess}, '', {});
				docs[i].name = user.local.email;
			} else {
				docs[i].name = "Unknown";
			}
		}
		return docs;
	}
};

exports.getContainerSettings = function(containerId, userData) {
	return new Promise((resolve, reject) => {
		if (userData.local.role === "staff") {
			// Return settings for given container
			Container
				.findOne({_id: containerId, localAccess: userData._id})
				.populate('localAccess overseasAccess')
				.exec((err, docs) => {
					if (err) throw err;
					resolve(docs);
				});
		} else if (userData.local.role === "overseas") {
			// Return settings for given container
			Container
				.findOne({_id: containerId, overseasAccess: userData._id})
				.populate('localAccess overseasAccess')
				.exec((err, docs) => {
					if (err) throw err;
					resolve(docs);
				});
		}
	});
};

exports.updateContainerSettings = function(containerId, data, userData) {
	return new Promise((resolve, reject) => {
		if (userData.local.role === "staff") {
			// Search users to see if an suitable account matches
			User.findOne({"local.email" : data.overseasAccountEmail, "local.role": "overseas"}, (err,docs) => {
				if (err) throw err;

				// Now set the company to be the overseas account
				if (docs !== null) {
					Container.findOneAndUpdate({_id: containerId}, {overseasAccess: docs._id}, (err, docs) => {
						if (err) throw err;
						resolve(docs);
					})
				} else {
					reject("No account found.");
				}
			});
		} else if (userData.local.role === "overseas") {
			// Search users to see if an suitable account matches
			User.findOne({"local.email" : data.localAccountEmail, "local.role": "staff"}, (err,docs) => {
				if (err) throw err;

				// Now set the company to be the overseas account
				if (docs !== null) {
					Container.findOneAndUpdate({_id: containerId}, {localAccess: docs._id}, (err, docs) => {
						if (err) throw err;
						resolve(docs);
					})
				} else {
					reject("No account found.");
				}
			});
		}
	});
};

exports.getContainerLines = async function(containerId, userData) {
	/*
	This function retrieves all of the transactions for a given container ID(usually given by the link).
	Also updates the container's last accessed date.

	- Excludes file metadata for higher query speeds

	Params:
	Return: Promise containing the transactions in the resolution
 	*/

	if (userData.local.role === "staff") {
		// Now return the container lines for the given container
		return Container.findOneAndUpdate(
			{_id: containerId, localAccess: userData._id},
			{dateLastAccessed: new Date()},
			{
				fields : {
					"containerLine.status.additionalFiles.data" : 0
				}
			}
		);
	} else if (userData.local.role === "overseas") {
		// Now return the container lines for the given container
		return Container.findOneAndUpdate(
			{_id: containerId, overseasAccess: userData._id},
			{dateLastAccessed: new Date()},
			{
				fields : {
					"containerLine.status.additionalFiles.data" : 0
				}
			}
		);
	}
};

exports.getLatestTransactionInfo = function(userData) {
	/*
	This function returns the _id and country of the most recent manifest. The most recent manifest is determined by
	either the last accessed or the last created (last created having a higher priority).

	Return: Object containing _id and departureCountry
	Params: None
	 */

	if (userData.local.role === "staff") {
		return Container.findOne({localAccess: userData._id}, '_id', {sort: {dateLastAccessed : -1}});
	} else if (userData.local.role === "overseas") {
		return Container.findOne({overseasAccess: userData._id}, '_id', {sort: {dateLastAccessed : -1}});
	}
};

exports.updateEntries = async function(resultsObj, userData, containerId) {
	/*
	This function updates the status and comments of specified rows

	Params:
		- obj: Object with key as the transaction's _id and value as the info to be updated
	Returns:
		- Object containing the updated transactions
	 */

	if (userData.role === "staff") {
		// Iterate over every _id value
		for (const entry of resultsObj.data) {
			// Update the Transaction with the new info
			await Container.findOneAndUpdate({ "_id": containerId, "containerLine._id": entry._id },
				{
					"$set": {
						"containerLine.$.comment": entry.comment,
						"containerLine.$.deliveryComment": entry.deliveryComment,
						"containerLine.$.status.stage": entry.status.stage,
						"containerLine.$.status.estPortArrivalDate": entry.status.estPortArrivalDate,
						"containerLine.$.status.actPortArrivalDate": entry.status.actPortArrivalDate,
						"containerLine.$.status.estDeliveryDate": entry.status.estDeliveryDate,
						"containerLine.$.status.actDeliveryDate": entry.status.actDeliveryDate,
						"containerLine.$.status.receivedBy": entry.status.receivedBy,
					}
				});
		}
	} else if (userData.role === "overseas") {
		// Iterate over every _id value
		for (const entry of resultsObj.data) {
			// Update the Transaction with the new info
			await Container.findOneAndUpdate({ "_id": containerId, "containerLine._id": entry._id },
				{
					"$set": {
						"containerLine.$.batchNo": entry.batchNo,
						"containerLine.$.trackingNo": entry.trackingNo,
						"containerLine.$.count": entry.count,
						"containerLine.$.area": entry.area,
						"containerLine.$.sender.firstName": entry.sender.firstName,
						"containerLine.$.sender.lastName": entry.sender.lastName,
						"containerLine.$.receiver.firstName": entry.receiver.firstName,
						"containerLine.$.receiver.lastName": entry.receiver.lastName,
						"containerLine.$.receiver.address": entry.receiver.address,
					}
				});
		}
	}
};

exports.uploadFile = async function (containerId, files, rowIds) {
	/*
	Uploads a given file based on the row ids
	Params:
		- id: String of the container id
		- files: Object containing the file info
		- rowIds: Array containing Strings of the row that contains the files
	 */
	let resultsObj = {
		files: {},
		upload: {
			id:{}
		}
	};

	resultsObj.files[containerId] = {};

	// Iterate over every row to add the file
	for (let index in rowIds) {
		// Make a new File
		let file = new File({
			_id: new mongoose.Types.ObjectId(),
			name: files.name,
			data: files.data,
			size : files.size,
			mimetype: files.mimetype,
			encoding: files.encoding
		});

		// Add info to object that will be sent back to client
		resultsObj.upload.id = file;
		delete resultsObj.upload.id.data;

		await Container.findOneAndUpdate(
			{"_id": containerId, "containerLine._id": rowIds[index]},
			{
				$push: {
					"containerLine.$.status.additionalFiles": file
				}
			},
			{
				upsert: true
			}
		);
	}

	return resultsObj;
};

exports.getFileObjById = async function(containerId, fileId) {
	// Get specific containerLine from database that matches the containerId and the fileId
	let res = await Container.findOne(
		{
			"_id": containerId,
			"containerLine.status.additionalFiles._id": fileId
		},
		{
			'_id': 1,
			'containerLine.$.status': 1
		}
	);

	// Search for file
	// if (!res.containerLine[0].status.hasOwnProperty('additionalFiles')) return new Error("test");
	const fileArray = res.containerLine[0].status.additionalFiles;

	let wantedFile;
	for (let file of fileArray) {
		if (file._id.toString() === fileId) wantedFile = file; // Found the file
	}


	return (wantedFile) ? wantedFile : new Error("File not found");
};


exports.deleteContainer = function (userId, containerId) {
	Container.deleteOne({_id: containerId, localAccess: userId}, (err, res) => {
		if (err) throw err;
	});
};


