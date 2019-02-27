
const xlsx = require('node-xlsx').default;
const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://localhost:27017';
mongoose.connect(url + "/balikbayanDB", {useNewUrlParser: true});

exports.parseNewFile = function(pathName) {
    // Create sender schema and model
    const senderSchema = new mongoose.Schema({
        lastName: String,
        firstName: String, 
        middleName: String,
        address: String,
        suburb: String,
        city: String,
        postCode: String,
        region: String,
        country: String,
        DOB: String,
        phoneNumber: String,
        email: String
    });

    const Sender = mongoose.model("Sender", senderSchema);

    // Create receiver schema and model
    const receiverSchema = new mongoose.Schema({
        lastName: String,
        firstName: String, 
        middleName: String,
        address: String,
        city: String,
        province: String,
        country: String,
        DOB: String,
        phoneNumber: String,
        email: String
    });

    const Receiver = mongoose.model("Receiver", receiverSchema);

    // Create transaction schema and model
    const transactionSchema = new mongoose.Schema({
        count: Number,
        noOfBoxes: Number,
        status: String,
        sender: senderSchema,
        receiver: receiverSchema
    });

    const Transaction = mongoose.model("Transaction", transactionSchema);

    console.log(`beginning parsing for file ${pathName}`);
    const worksheet = xlsx.parse(pathName);
    
    // Iterate over every spreadsheet
    worksheet.forEach((item) => {
        console.log(`Processing worksheet: ${item.name}`);

        // Save the header row for indexing
        const headerRow  = item.data[0];

        // Obtain rest of the data 
        for (let i = 1; i < item.data.length; i++) {
            // Obtain the new row
            const row = item.data[i];

            // Create sender model
            let sender = new Sender({
                lastName: row[2],
                firstName: row[3], 
                middleName: row[4],
                address: row[5],
                suburb: row[6],
                city: row[7],
                postCode: row[8],
                region: row[9],
                country: row[10],
                DOB: row[11],
                phoneNumber: row[12],
                email: row[13]
            });
            
            // Create receiver model
            let receiver = new Receiver({
                lastName: row[14],
                firstName: row[15], 
                middleName: row[16],
                address: row[17],
                city: row[18],
                province: row[19],
                country: row[20],
                DOB: row[21],
                phoneNumber: row[22],
                email: row[23]
            });

            let transaction = new Transaction({
                count: row[0],
                noOfBoxes: row[1],
                sender: sender,
                receiver: receiver
            });
            
            // Save all schemas
            sender.save();
            receiver.save();
            transaction.save();
        }
    });  
};