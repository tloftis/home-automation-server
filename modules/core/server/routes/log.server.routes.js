'use strict';

/**
 * Module dependencies.
 */
let log = require('../controllers/log.server.controller');

module.exports = function (app) {
    app.route('/api/log').
        get(log.list).
        post(log.add);

    app.route('/api/log/:logId').
        get(log.get);

    app.param('logId', log.logById);
};
