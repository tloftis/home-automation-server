'use strict';

const async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    logs = mongoose.model('Logs');

let debugLog = {
    error (str, obj) {
        console.log(chalk.bold.red(str), obj || '');
    },
    info (str, obj) {
        console.log(chalk.blue.bold.underline(str), obj || '');
    },
    success (str, obj) {
        console.log(chalk.green.bold(str), obj || '');
    }
};

function addLog(typ, msg, data, source, callback){
    let log = new logs({
        message: msg,
        type: typ,
        source: source,
        data: data
    });

    if((process.env.NODE_ENV || '').toLowerCase() === 'development'){
        debugLog[typ](msg,data);
    }

    return log.save(function(err, newLog){
        if(callback){
            callback(err, newLog);
        }
    });
}

exports.error = function(msg, data){
    return addLog('error', msg, data, null);
};

exports.success = function(msg, data){
    return addLog('success', msg, data, null);
};

exports.info = function(msg, data){
    return addLog('info', msg, data, null);
};

exports.list = function(req, res){
    let limit = +(req.query || {}).limit || 100;

    log.find({}).sort({ created: -1 }).limit(limit).lean().exec(function(err, logs){
        if(err){
            return res.status(400).send({
                message: err.message
            });
        }

        res.json(logs);
    });
};

exports.get = function (req, res){
    res.json(req.message);
};

exports.add = function (req, res){
    let reqLog = req.body || {};

    if(reqLog){
        let ip = (req.headers || {})['x-forwarded-for'] || (req.connection || {}).remoteAddress;

        return addLog(reqLog.type, reqLog.message, reqLog.data, ip, function(err, log){
            if (err) {
                return res.status(400).send({
                    message: err.message
                });
            }

            res.json(log);
        });
    }

    return res.status(400).send({
        message: 'Log message not specified'
    });
};

exports.logById = function (req, res, next, id){
    if(!id){
        return res.status(400).send({
            message: 'Message ID not found'
        });
    }

    log.findById(id).lean().exec(function(err, log){
        if(err){
            return res.status(400).send({
                message: err.message
            });
        }

        res.message = log;
        return next();
    });
};
