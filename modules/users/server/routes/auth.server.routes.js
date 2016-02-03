'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    users =require('../controllers/users.server.controller');

module.exports = function (app) {
    // Setting up the users password api
    app.route('/api/auth/signin').
        post(users.signin);

    app.route('/api/auth/signout').
        get(users.signout);
};
