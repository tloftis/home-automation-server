'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    NodeAPI = mongoose.model('NodeAPI'),
    crypto = require('crypto'),
    masterNode = require('./node.server.controller'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');


function genId(){
    return crypto.randomBytes(30).toString('hex');
}

exports.list = function(req, res){
    res.json([{}]);
};

exports.get = function (req, res){
    res.json({}); //Gives the driver as well as the input info
};

exports.update = function (req, res){
    res.json({}); //Gives the driver as well as the input info
    return res.status(400).send('Error attempting to remove input from server memory');
};

exports.remove = function (req, res){
    res.json({}); //Gives the driver as well as the input info
    return res.status(400).send('Error attempting to remove input from server memory');
};

exports.create = function (req, res){
    var api = res.body || {};

    if(!api.name){
        return res.status(400).send('Error name is required');
    }

    res.json({}); //Gives the driver as well as the input info
    return res.status(400).send('Error attempting to remove input from server memory');
};

exports.inputById = function (req, res, next, id){
    if(!(req.input = masterNode.inputHash[id])){
        return res.status(400).send({
            message: 'Input id not found'
        });
    }

    return next();
};
