'use strict';

/**
 * Module dependencies.
 */
const outputs = require('../controllers/node-outputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/output').
        get(outputs.list);

    // Users collection routes
    app.route('/api/output/:outputId').
        get(outputs.get).
        put(outputs.update).
        post(outputs.set).
        delete(outputs.remove);

    // Finish by binding the user middleware
    app.param('outputId', outputs.outputById);
};
