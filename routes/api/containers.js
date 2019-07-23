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
// 	Can add query parameter recent to retrieve most recent container
// @access
containers.get('/', getJWTToken, async (req, res, next) => {
	const country = decodeURIComponent(req.params.country);
	const id = decodeURIComponent(req.params.id);

	let containers = await databases.getContainersByUser(req['authorizedData']);

	res.json(containers);
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
containers.get('/:containerId', (req, res, next) => {
	res.send('GET api/containers/containerId');
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