const settings = require('express').Router();

// @route GET api/containers/:containerId/settings
// @desc
// 	Gets the settings for a given container based on the cId
// @access
settings.get('/', (req, res, next) => {
	const containerId = req.containerId;

	res.send('GET api/containers/:containerId/settings');
});

// @route PUT api/containers/:containerId/files/:fileId
// @desc
// 	Updates the settings for a given container based on the cId
// @access
settings.put('/', (req, res, next) => {
	const containerId = req.containerId;

	res.send('PUT api/containers/:containerId/settings');
});

module.exports = settings;