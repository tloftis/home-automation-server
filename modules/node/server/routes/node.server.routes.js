'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/node.server.policy'),
    node = require('../controllers/node.server.controller');

module.exports = function (app) {
    // Users collection routes
    app.route('/api/node/list').
        get(node.list);//.
        //post(adminPolicy.isAllowed, admin.createUser);

    // Single user routes
    app.route('/api/node/set').
        post(node.set);

    // Finish by binding the user middleware
    //app.param('userId', admin.userByID);
};
