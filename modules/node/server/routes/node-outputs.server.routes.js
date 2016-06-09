'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    outputs = require('../controllers/node-outputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/output').
        get(outputs.list);

    // Users collection routes
    app.route('/api/output/edit/:outputId').
        get(outputs.get).
        put(outputs.update).
        delete(outputs.remove);

    app.route('/api/output/drivers/:outputDriverId').
        get(outputs.getDriver);

    // Users collection routes
    app.route('/api/output/edit/:outputId/set').
        post(outputs.set);

    // Finish by binding the user middleware
    app.param('outputId', outputs.outputById);
    app.param('outputDriverId', outputs.driverById);
};
