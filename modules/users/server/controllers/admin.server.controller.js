'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
    res.json(req.model);
};

/**
 * Update a User
 */
exports.createUser = function (req, res) {
    // Init Variables
    var user = new User(req.body);

    // Add missing user fields
    user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;
    user.enabled = req.body.enabled;

    // Then save the user
    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        res.json(user);
    });
};

/**
 * Update a User
 */
exports.update = function (req, res) {
    var user = req.model;

    //For security purposes only merge these parameters
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.username = req.body.username || user.username;

    user.email = req.body.email || user.email;
    user.displayName = user.firstName + ' ' + user.lastName;

    user.roles = req.body.roles || user.roles;
    user.enabled = req.body.enabled || user.enabled;

    if(req.body.password){
        user.password = req.body.password;
    }

    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        res.json(user);
    });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
    var user = req.model;

    user.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        res.json(user);
    });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
    User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        res.json(users);
    });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'User is invalid'
        });
    }

    User.findById(id, '-salt -password').exec(function (err, user) {
        if (err) {
            return next(err);
        } else if (!user) {
            return next(new Error('Failed to load user ' + id));
        }

        req.model = user;
        next();
    });
};
