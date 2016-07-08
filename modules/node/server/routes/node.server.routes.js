'use strict';

/**
 * Module dependencies.
 */
var nodePolicy = require('../policies/node.server.policy'),
    node = require('../controllers/node.server.controller.js'),
    outputs = require('../controllers/node-outputs.server.controller.js'),
    drivers = require('../controllers/node-drivers.server.controller.js'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node').all(nodePolicy.isAllowed).
        get(node.list).
        put(node.updateNodes);

    app.route('/api/node/:nodeId').all(nodePolicy.isAllowed).
        get(node.get).
        put(node.update).
        post(node.updateNode); //this will have the server call down to the node to make it update

    app.route('/api/node/:nodeId/output').all(nodePolicy.isAllowed).
        post(outputs.add);

    app.route('/api/node/:nodeId/input').all(nodePolicy.isAllowed).
        post(inputs.add);

    app.route('/api/node/:nodeId/driver').all(nodePolicy.isAllowed).
        post(drivers.add);

    app.param('nodeId', node.nodeById);
};
