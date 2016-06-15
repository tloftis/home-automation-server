'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    app.route('/api/input').
        get(inputs.list);

    app.route('/api/input/edit/:inputId').
        get(inputs.get).
        put(inputs.update).
        post(inputs.change).
        delete(inputs.remove);

    app.route('/api/input/drivers/:inputDriverId').
        get(inputs.getDriver);

    app.param('inputId', inputs.inputById);
    app.param('inputDriverId', inputs.driverById);
};
