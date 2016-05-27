'use strict';

/**
 * Module dependencies.
 */
var links = require('../controllers/node-links.server.controller.js');

module.exports = function (app) {
    app.route('/api/link').
        get(links.list);

    app.route('/api/link/:linkId').
        get(links.get).
        put(links.update).
        post(links.add).
        delete(links.remove);

    app.param('linkId', links.linkById);
};
