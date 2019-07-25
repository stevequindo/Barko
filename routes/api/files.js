const files = require('express').Router();
const getJWTToken = require('../../validation/jwttoken');
const databases = require('../../db/databases');

// @route GET api/containers/:containerId/files
// @desc Gets all files from a given container based on the cId
// @access Requires user login
files.get('/', getJWTToken, (req, res, next) => {
	const containerId = req.containerId;
	const userData = req['authorizedData'];

	res.send(files);
});

// @route GET api/containers/:containerId/files/:fileId
// @desc Gets a single file from a given container based on the cId and the fId
// @access Everyone
files.get('/:fileId', async (req, res, next) => {
	const containerId = req.containerId;
	const fileId = req.params.fileId;
	const userData = req['authorizedData'];

	const fileObj = await databases.getFileById(userData, containerId , fileId);

	// Send file to client
	res.writeHead(200, {
		'Content-Type': fileObj.mimetype,
		'Content-Disposition': `attachment; filename=${fileObj.name}`,
		'Content-Length': fileObj.size
	});

	res.end(fileObj.data);
});

module.exports = files;