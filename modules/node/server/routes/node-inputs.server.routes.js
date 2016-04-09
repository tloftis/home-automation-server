'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
    app.route('/api/input').
        get(inputs.list);

    app.route('/api/input/:inputId').
        get(inputs.get).
        put(inputs.update).
        delete(inputs.remove);

    /*
    app.route('/api/input/:inputId/link').
        get(inputs.getInputLinks).
        post(inputs.addInputLink);

    app.route('/api/input/:inputId/link/:linkId').
        put(inputs.updateInputLinks).
        post(inputs.addInputLink);
    */

    app.param('inputId', inputs.inputById);
};
