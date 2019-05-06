
// Function to authenticate page routes, else redirects to login page
exports.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated())
        return next();

    res.redirect('/');
};

exports.getJsonWorkbook = function(pathName) {
    /*
        Params:
            pathName: File path to the Excel spreadsheet
        Returns:
            jsonWorkbook: JSON with key as the individual sheet and value as the array containing the rows (as objects)
    */
    let workbook = XLSX.readFile(pathName);
    let sheetNames = workbook.SheetNames;
    let jsonWorkbook = {};

    // Iterate over every sheet
    for (let i = 0; i < sheetNames.length; i ++) {
        const sheet = workbook.Sheets[sheetNames[i]];
        const jsonSheet = XLSX.utils.sheet_to_json(sheet);

        // Append to jsonWorkbook with key = sheetName and value = jsonSheet
        jsonWorkbook[sheetNames[i]] = jsonSheet;
    }


    return jsonWorkbook;
};