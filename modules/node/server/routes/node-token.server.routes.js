'use strict';

/**
 * Module dependencies.
 */
var nodePolicy = require('../policies/node-token.server.policy'),
    nodeToken = require('../controllers/node-token.server.controller.js'),
    outputs = require('../controllers/node-outputs.server.controller.js'),
    drivers = require('../controllers/node-drivers.server.controller.js'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node/token').all(nodePolicy.isAllowed).
        get(nodeToken.list).
        post(nodeToken.create);

    app.route('/api/node/token/:tokenId').all(nodePolicy.isAllowed).
        get(nodeToken.get).
        put(nodeToken.update).
        delete(nodeToken.remove);

    app.param('tokenId', nodeToken.tokenById);
};
