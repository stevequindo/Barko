const files = require('express').Router();

// @route GET api/containers/:containerId/files
// @desc
// @access
files.get('/', (req, res, next) => {
	const containerId = req.containerId;
	res.send('GET api/containers/:containerId/files');
});

// @route GET api/containers/:containerId/files/:fileId
// @desc
// @access
files.get('/:fileId', (req, res, next) => {
	const containerId = req.containerId;
	const fileId = req.params.fileId;

	res.send('GET api/containers/:containerId/files/:fileId');
});

module.exports = files;