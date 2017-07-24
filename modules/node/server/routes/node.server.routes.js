'use strict';

/**
 * Module dependencies.
 */
let nodePolicy = require('../policies/node.server.policy'),
    node = require('../controllers/node.server.controller.js'),
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

    app.route('/api/node/:nodeId').all(nodePolicy.isAllowed).
        get(node.get).
        put(node.update).
        post(node.updateNode); // this will have the server call down to the node to make it update

    app.route('/api/node/:nodeId/enabled').all(nodePolicy.isAllowed).
        put(node.enableDisable); // this will have the server call down to the node to make it update

    app.route('/api/node/:nodeId/output').all(nodePolicy.isAllowed).
        post(outputs.add);

    app.route('/api/node/:nodeId/input').all(nodePolicy.isAllowed).
        post(inputs.add);

    app.route('/api/node/:nodeId/driver').all(nodePolicy.isAllowed).
        post(drivers.add);

    app.param('nodeId', node.nodeById);
};
