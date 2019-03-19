# BalikbayanCommFiles

## MVP Functionality Check List (due 25th March)
Overseas = Anywhere not Philippines

1. **Overseas (NZ) Company side**
	- [x] Drag and drop excel sheet to a joint communication channel between the agency overseas **_already done (needs presentation)_**
	- [ ] Read only **_a day_**
	- [x] Set up database a service **_a few seconds to a week_**

2. **Philippines Company side**
	- [x] Show all of the rows **_a week or less_**
	- [x] Each row parsed from excel sheet has its unique tracking number **_inherently included_**
	- [] Each row/tracking number has an option to update the status of the box **_takes about a day_**
		- [] Updating status of the box by typing in an input box next to the row (from our software) 
	- [x] Any updates are also seen by overseas company **_inherently done_**
	
3. **Customer Side**
	- [x] Able to enter details (tracking number, last name etc/ whatever is necessary) to display information about its status **_(UI: 3 days, logic: 0.5 day)_**
		- [x] ADDITIONAL: Ability to add multiple tracking numbers
		- [ ] Information includes **_inherently done_**
			- [ ] Eta
			- [ ] What stage of the journey it is in
			
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
	
