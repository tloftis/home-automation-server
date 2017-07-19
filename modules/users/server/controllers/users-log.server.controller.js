'use strict';

/**
 * Module dependencies.
 */
let path = require('path'),
    mongoose = require('mongoose'),
    // log = require(path.resolve('./config/lib/winston')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
function masterLogger(user, msg, data, type){
    if (!user || !user.displayName || !user._id){
        return new Error('User with a username and ID must be specified!');
    }

    if (!msg){
        return new Error('A message must be specified!');
    }

    // Init Variables
    let UsersLog = mongoose.model('UsersLog');
    let log = new UsersLog({ createdBy: user, username: user.displayName, msg: msg, data: data, type: type });

    // Then save the user
    log.save(function (err){
        if (err){
            log.error('Error attempting to save log!', err);
        }
    });
}

/**
 * Show the current user
 */
let userLogger = function (user, msg, data){
    masterLogger(user, msg, data, 'other');
};

userLogger.remove = function(user, msg, data){
    masterLogger(user, msg, data, 'remove');
};

userLogger.update = function(user, msg, data){
    masterLogger(user, msg, data, 'update');
};

userLogger.create = function(user, msg, data){
    masterLogger(user, msg, data, 'create');
};

exports.logUserChange = userLogger;

exports.getLogs = function (req, res) {
    let query = mongoose.model('UsersLog').find({}).sort('-created');

    if (req.query.populate){
        query = query.populate('createdBy');
    }

    query.exec(function (err, users) {
        if (err) {
            // log.error('Error attempting to get logs!', err);

            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        res.json(users);
    });
};

