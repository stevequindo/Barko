# BalikbayanCommFiles
## Key Changes finished before trial starts

**Kayee**
1. **Two inputs for the tracking**
	- [x] Tracking number AND surname (make sure to lower the letters of the inputs).

2. **In tracking view, should see "Estimated arrival to Port"**
	- [ ] Add "Estimated arrival to Port".
	- [ ] Show the actual date which was inputted in the table.
	
3. **Status changes**
	- [ ] At Departing Port
	- [ ] On Transit
	- [ ] At Destination Port
		- [ ] When they click this, they want a note underneath showing arrival date in Philippines.
		- [ ] When updating the status in the table, they get ito enter in the date it arrived.
	- [ ] At Customs
	- [ ] For Dispatch
	- [ ] For Delivery
		- [ ] When updating status, they can type in the estimated delivery date when they click this.
	- [ ] Delivered
		- [ ] Will show the actualy delievered date and recevied by (name of the individual).
		
**Nicholas**
1. **Need to improve general server speed**
2. **Table Changes**
	- New column to be added to the table (Estimated arrival at Port)
		- [x] Between status and comments.
		- [x] Data type.
	- After Receiver, add another column "Delivery Address"
		- [x] This is the receiver's address.
3. **Edit Rights**
	- [ ] Philippines company gets to update the status, esmitated arrivals, comments.
	- [ ] Overseas company to edit everything until status.

4. **Add in function to get the actual Excel to be able to be downloaded**
	- [ ] Get the chance to view the original file
	- [ ] Little download button on the container and in the table itself.
	
**Notes**
- They don't need to fill in any of those fields (it'll just show 'Unknown' or maybe no message at all).
- Low priority: An All button to view all manifest transactions together in order to search every entry.

**Anyone**
- Website and data security are a **BIG CONCERN**
	- [x] Database to be access only by then.
	- [ ] Implement better database system for different links between companies.
	- [ ] Their only concern is the database, they want their database to be accessed only by them (and the Philippines agency).
 










## MVP Functionality Check List (due 25th March)
Overseas = Anywhere not Philippines

1. **Overseas (NZ) Company side**
	- [x] Drag and drop excel sheet to a joint communication channel between the agency overseas **_already done (needs presentation)_**
	- [x] Read only **_a day_**
	- [x] Set up database a service **_a few seconds to a week_**

2. **Philippines Company side**
	- [x] Show all of the rows **_a week or less_**
	- [x] Each row parsed from excel sheet has its unique tracking number **_inherently included_**
	- [x] Each row/tracking number has an option to update the status of the box **_takes about a day_**
		- [x] Updating status of the box by typing in an input box next to the row (from our software) 
	- [x] Any updates are also seen by overseas company **_inherently done_**
	
3. **Customer Side**
	- [x] Able to enter details (tracking number, last name etc/ whatever is necessary) to display information about its status **_(UI: 3 days, logic: 0.5 day)_**
		- [x] ADDITIONAL: Ability to add multiple tracking numbers
		- [x] Information includes **_inherently done_**
			- [x] Eta
			- [x] What stage of the journey it is in
			
4. **Additional Features not needed in MVP**
	- Pinging the user when an update is made.
	- Saving tracking numbers
	- Create comms_meta database (table: companies containing company name and dbName, etc.)

## Features
1. **Company side**
	- Parsing data from (standardised) excel sheets
		- Drag/drop into software → Take all relevant data, organise into an entry for each individual box→ Company can update the individual boxes
	- Excel sheet received should be standardised or we can give them a standard template to follow
	- Future implementation: Maybe allow for different structures
		- Suggestion: Ask company to specify column names for their senders, receivers, transactions
	- Updating the status of customer boxes
		- Want to be able to see each transaction
		
2. **Customer side**
	- Typing in tracking number and getting relevant information
	
