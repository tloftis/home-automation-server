'use strict';

/**
 * Module dependencies.
 */
var nodePolicy = require('../policies/node-api.server.policy'),
    nodeApi = require('../controllers/node-api.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node/token').all(nodePolicy.isAllowed).
        get(nodeApi.list).
        post(nodeApi.create);

    app.route('/api/node/token/:tokenId').all(nodePolicy.isAllowed).
        get(nodeApi.get).
        put(nodeApi.update).
        delete(nodeApi.remove);

    app.route('/api/node/token/register').all(nodePolicy.isAllowed).
        post(nodeApi.register);

    app.param('tokenId', nodeApi.tokenById);
};
