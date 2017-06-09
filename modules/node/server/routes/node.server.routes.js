'use strict';

/**
 * Module dependencies.
 */
var nodePolicy = require('../policies/node.server.policy'),
    node = require('../controllers/node.server.controller.js'),
    nodeToken = require('../controllers/node-token.server.controller.js'),
    nodeComm = rootRequire('./modules/node/server/lib/node-communication.js'),
    outputs = require('../controllers/node-outputs.server.controller.js'),
    drivers = require('../controllers/node-drivers.server.controller.js'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node').
        get(nodePolicy.isAllowed, node.list).
        post(nodeComm.verifyToken, node.register).
        put(nodePolicy.isAllowed, node.updateNodes);

    // Users collection routes
    app.route('/api/node/server-token').
        get(nodePolicy.isAllowed, node.getServerToken);

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
