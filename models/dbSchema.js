const mongoose = require('mongoose');
const User = require("./User");
const Schema = mongoose.Schema;

const senderSchema = new mongoose.Schema({
	firstName: {
		type: String
	},
	middleName: String,
	lastName: {
		type: String
	},
	address: String,
	suburb: String,
	city: String,
	postCode: String,
	region: String,
	country: String,
	dob: Date,
	mobileNo: String,
	email: String
});

const receiverSchema = new mongoose.Schema({
	firstName: {
		type: String
	},
	middleName: String,
	lastName: {
		type: String
	},
	address: String,
	city: String,
	province: String,
	country: String,
	contactNo: String,
	email: String,
});

const fileSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	name: {
		type: String
	},
	data : {
		type: Buffer
	},
	size : {
		type: Number
	},
	mimetype: {
		type: String
	},
	encoding: {
		type: String
	}
});

module.exports.File = mongoose.model('File',fileSchema);

const statusSchema = new mongoose.Schema({
	stage: {
		type: String,
		default: "At Departing Port"
	},
	estPortArrivalDate: {
		type: Date
	},
	actPortArrivalDate: {
		type: Date
	},
	estDeliveryDate: {
		type: Date
	},
	actDeliveryDate: {
		type: Date
	},
	receivedBy: {
		type: String
	},
	additionalFiles: {
		type: [fileSchema]
	}
});

const containerLineSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	count: Number, 
	batchNo: String,
	trackingNo: {
        type: String
	},
	area: {
        type: String
	},
	status: statusSchema,
	comment: {
        type: String
	},
	sender : {
    	type: senderSchema,
		required: true
	},
	receiver : {
		type: receiverSchema,
		required: true
	}
});

module.exports.ContainerLine = mongoose.model("ContainerLine", containerLineSchema);

const containerSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	dateAdded: Date,
	dateLastAccessed: Date,
	containerNo: String,
	departureCountry: String,
	targetCountry : String,
	containerLine: [containerLineSchema],
	localAccess: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	overseasAccess: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
});

module.exports.Container = mongoose.model("Container", containerSchema);