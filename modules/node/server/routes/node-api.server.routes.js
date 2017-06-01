'use strict';

/**
 * Module dependencies.
 */
var nodePolicy = require('../policies/node.server.policy'),
    nodeApi = require('../controllers/node-api.server.controller.js');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/token').all(nodePolicy.isAllowed).
        get(nodeApi.list);

    app.route('/api/token/:tokenId').all(nodePolicy.isAllowed).
        get(nodeApi.get).
        put(nodeApi.update).
        delete(nodeApi.remove).
        post(nodeApi.create); //this will have the server call down to the node to make it update

    app.route('/api/token/register').all(nodePolicy.isAllowed).
        post(nodeApi.register);

    app.param('tokenId', nodeApi.tokenById);
};
