'use strict';

var async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    log = mongoose.model('log');

exports.list = function(req, res){
    log.find({}).lean().exec(function(err, links){
        if(err){
            return res.status(400).send({
                message: err.message
            });
        }

        res.json(links);
    });
};

exports.get = function (req, res){
    res.json(req.message);
};

exports.add = function (req, res){
    var newLog = {},
        reqLog = (req.body || {}).log;

    if(reqLog){
        if(reqLog.message){
            newLog.message = reqLog.message;
        }

        if(reqLog.error){
            newLog.error = new Error(reqLog.error);
        }

        if(reqLog.data){
            newLog.data = reqLog.data;
        }

        var log = new NodeLink(newLink);

        return log.save(function(err){
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
