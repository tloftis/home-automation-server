'use strict';

/**
 * Module dependencies.
 */
var nodeInputPolicy = require('../policies/node-input.server.policy'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    app.route('/api/input').all(nodeInputPolicy.isAllowed).
        get(inputs.list);

    app.route('/api/input/:inputId').all(nodeInputPolicy.isAllowed).
        get(inputs.get).
        put(inputs.update).
        post(inputs.change).
        delete(inputs.remove);

    app.param('inputId', inputs.inputById);
};
