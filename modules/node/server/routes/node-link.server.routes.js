'use strict';

/**
 * Module dependencies.
 */
var nodeLinksPolicy = require('../policies/node-links.server.policy'),
    links = require('../controllers/node-links.server.controller.js');

//.js
module.exports = function (app) {
    app.route('/api/link').all(nodeLinksPolicy.isAllowed).
        get(links.list).
        post(links.add);

    app.route('/api/link/:linkId').all(nodeLinksPolicy.isAllowed).
        get(links.get).
        put(links.update).
        delete(links.remove);

    app.route('/api/pipe').all(nodeLinksPolicy.isAllowed).
        get(links.getPipes);

    app.param('linkId', links.linkById);
};
