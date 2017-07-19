'use strict';

/**
 * Module dependencies.
 */
let nodeOutputPolicy = require('../policies/node-output.server.policy'),
    outputs = require('../controllers/node-outputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/output').all(nodeOutputPolicy.isAllowed).
        get(outputs.list);

    // Users collection routes
    app.route('/api/output/:outputId').all(nodeOutputPolicy.isAllowed).
        get(outputs.get).
        put(outputs.update).
        post(outputs.set).
        delete(outputs.remove);

    // Finish by binding the user middleware
    app.param('outputId', outputs.outputById);
};
