'use strict';

/**
 * Module dependencies.
 */
var nodeInputPolicy = require('../policies/node-input.server.policy'),
  nodeComm = rootRequire('./modules/node/server/lib/node-communication.js'),
  inputs = require('../controllers/node-inputs.server.controller.js');

module.exports = function (app) {
  app.route('/api/input').all(nodeInputPolicy.isAllowed).
        get(inputs.list);

  app.route('/api/input/:inputId').
        get(nodeInputPolicy.isAllowed, inputs.get).
        put(nodeInputPolicy.isAllowed, inputs.update).
        post(nodeComm.verifyToken, inputs.change).
        delete(nodeInputPolicy.isAllowed, inputs.remove);

  app.param('inputId', inputs.inputById);
};
