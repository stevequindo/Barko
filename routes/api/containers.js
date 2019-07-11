const containers = require('express').Router();
const files = require('./files');
const settings = require('./settings');

// @route GET api/containers
// @desc
// @access
containers.get('/', (req, res, next) => {
	res.send('GET api/containers');
});

// @route POST api/containers
// @desc
// @access
containers.post('/', (req, res, next) => {
	res.send('POST api/containers');
});

// @route GET api/containers/:containerId
// @desc
// @access
containers.get('/:containerId', (req, res, next) => {
	res.send('GET api/containers/containerId');
});

// @route PUT api/containers/:containerId
// @desc
// @access
containers.put('/:containerId', (req, res, next) => {
	res.send('PUT api/containers/containerId');
});

// @route DELETE api/containers/:containerId
// @desc
// @access
containers.delete('/:containerId', (req, res, next) => {
	res.send('DELETE api/containers/containerId');
});

// Leads to routes that start with /api/containers/:containerId/files
containers.use('/:containerId/files', (req, res, next) => {
	req.containerId = req.params.containerId;
	next()
}, files);

// Leads to routes that start with /api/containers/:containerId/settings
containers.use('/:containerId/settings', (req, res, next) => {
	req.containerId = req.params.containerId;
	next()
}, settings);

module.exports = containers;