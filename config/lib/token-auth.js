'use strict';

const async = require('async'),
    _ = require('lodash'),
    config = rootRequire('./config/config.js'),
    log = rootRequire('./modules/core/controllers/log.server.controller.js');

exports.verifyToken = function(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                log.error(`Error while verifying token: ${token}`, err);
                reject(err);
            }

            resolve(decoded);
        });
    })
};

exports.generatNodeToken = function (data){
    return Promise.resolve(jwt.sign({
        ...data,
        roles: ['node']
    }, config.secret));
};
