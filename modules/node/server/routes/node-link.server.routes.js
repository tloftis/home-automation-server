'use strict';

/**
 * Module dependencies.
 */
var links = require('../controllers/node-links.server.controller.js');

module.exports = function (app) {
    app.route('/api/link').
        post(links.add).
        get(links.list);

    app.route('/api/link/:linkId').
        get(links.get).
        put(links.update).
        delete(links.remove);

    app.param('linkId', links.linkById);
};
