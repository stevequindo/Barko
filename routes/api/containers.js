const containers = require('express').Router();
const files = require('./files');
const settings = require('./settings');
const getJWTToken = require('../../validation/jwttoken');
const databases = require('../../db/databases');

// Notes on child routing : https://gist.github.com/zcaceres/f38b208a492e4dcd45f487638eff716c

// @route GET api/containers
// @desc
// 	Gets all containers (that the user has access to)
// 	Can add query parameter country to filter by countries
// @access Requires user login
containers.get('/', getJWTToken, async (req, res, next) => {
	if (typeof req.query.country === 'undefined') { // do not filter by country
		let containers = await databases.getContainersByUser(req['authorizedData']);
		res.json(containers);
	} else { 	// filter by country
		let containers = await databases
			.getContainersByUserAndCountry(req['authorizedData'], req.query.country);
		res.json(containers);
	}
});

// @route POST api/containers
// @desc
// 	Uploads a container
// @access
containers.post('/', (req, res, next) => {
	res.send('POST api/containers');
});

// @route GET api/containers/:containerId
// @desc
// 	Gets a specific container based on a cId
// 	Can add query parameters trackingNumber and surname to retrieve specific row from container
// @access
containers.get('/:containerId', getJWTToken, async (req, res, next) => {
	const id = req.params.containerId;
	let container = await databases.findContainerById(req['authorizedData'], id);
	res.json(container);
});

// @route PUT api/containers/:containerId
// @desc
// 	Updates a specific container based on a cId
// @access
containers.put('/:containerId', (req, res, next) => {
	res.send('PUT api/containers/containerId');
});

// @route DELETE api/containers/:containerId
// @desc
// 	Deletes a container based on a cId
// @access
containers.delete('/:containerId', async (req, res, next) => {
	const id = req.params.containerId;
	let result = await databases.deleteContainerById(req['authorizedData'], id);
	res.json(result);
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