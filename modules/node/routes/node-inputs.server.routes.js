'use strict';

/**
 * Module dependencies.
 */
const inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    app.route('/api/input').
        get(inputs.list);

    app.route('/api/input/:inputId').
        get(inputs.get).
        put(inputs.update).
        post(inputs.change).
        delete(inputs.remove);

    app.param('inputId', inputs.inputById);
};
