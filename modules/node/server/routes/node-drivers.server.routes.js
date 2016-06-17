'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    drivers = require('../controllers/node-drivers.server.controller.js');

module.exports = function (app) {
    app.route('/api/driver').
        get(drivers.list);

    app.route('/api/driver/:anyDriversId').
        delete(drivers.removeDriver);

    app.param('anyDriversId', drivers.driverById);
};
