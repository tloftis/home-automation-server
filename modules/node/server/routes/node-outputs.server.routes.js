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
    app.route('/api/output/:outputId').
        get(outputs.get).
        put(outputs.update).
        delete(outputs.remove);

    // Users collection routes
    app.route('/api/output/:outputId/set').
        post(outputs.set);

    // Finish by binding the user middleware
    app.param('outputId', outputs.outputById);
};
