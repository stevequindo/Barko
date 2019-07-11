const settings = require('express').Router();

// @route GET api/containers/:containerId/settings
// @desc
// @access
settings.get('/', (req, res, next) => {
	const containerId = req.containerId;

	res.send('GET api/containers/:containerId/settings');
});

// @route PUT api/containers/:containerId/files/:fileId
// @desc
// @access
settings.put('/', (req, res, next) => {
	const containerId = req.containerId;

	res.send('PUT api/containers/:containerId/settings');
});

module.exports = settings;