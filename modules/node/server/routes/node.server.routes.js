'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    node = require('../controllers/node.server.controller.js'),
    outputs = require('../controllers/node-outputs.server.controller.js'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node').
        get(node.list);

    app.route('/api/node/:nodeId').
        get(node.get).
        put(node.update);

    app.route('/api/node/:nodeId/output').
        post(outputs.add);

    app.route('/api/node/:nodeId/input').
        post(inputs.add);

    app.param('nodeId', node.nodeById);
};
