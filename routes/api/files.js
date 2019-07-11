const files = require('express').Router();

// @route GET api/containers/:containerId/files
// @desc
// 	Gets all files from a given container based on the cId
// @access
files.get('/', (req, res, next) => {
	const containerId = req.containerId;
	res.send('GET api/containers/:containerId/files');
});

// @route GET api/containers/:containerId/files/:fileId
// @desc
// 	Gets a single file from a given container based on the cId and the fId
// @access
files.get('/:fileId', (req, res, next) => {
	const containerId = req.containerId;
	const fileId = req.params.fileId;

	res.send('GET api/containers/:containerId/files/:fileId');
});

module.exports = files;