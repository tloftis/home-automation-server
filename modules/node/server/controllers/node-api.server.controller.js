'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    NodeAPI = mongoose.model('NodeAPI'),
    crypto = require('crypto'),
    nodeComm = rootRequire('./modules/node/server/lib/node-communication.js'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

function genId(){
    return crypto.randomBytes(40).toString('hex');
}

exports.list = function(req, res){
    NodeAPI.find({}).lean().exec(function(err, tokens){
        if (err) {
            log.error('Failed to get tokens', err);

            return res.status(400).send({
                message: err.message
            });
        }

        res.json(tokens || []);
    });
};

exports.get = function (req, res){
    res.json(req.token);
};

exports.update = function (req, res){
    var token = req.token,
        newToken = req.body.token || {};

    token.description = newToken.description || token.description;
    token.name = newToken.name || token.name;

    if(req.user.roles.indexOf('admin') !== -1){
        token.permissions = newToken.permissions || token.permissions;
    }

    return token.save(function(err){
        if (err) {
            log.error('Failed to update token: ' + token.token + ', id:' + token._id, err);

            return res.status(400).send({
                message: err.message
            });
        }

        log.info('Updated token: ' + token.token + ', id:' + token._id, token);
        res.json(link);
    });
};

exports.remove = function (req, res){
    let token = req.token;

    token.remove(function (err) {
        if (err) {
            log.error('Failed to remove token: ' + token.token + ', id:' + token._id, err);

            return res.status(400).send({
                message: err.message
            });
        }

        log.info('Removed token: ' + token.token, token);
        res.json(token);
    });
};

exports.create = function (req, res){
    let api = res.body || {};

    if(!api.name){
        return res.status(400).send('Error name is required');
    }

    if(!api.permissions){
        api.permissions = [];
    } else if (typeof api.permissions === 'string') {
        api.permissions = [api.permissions];
    }

    api.token = genId();
    let newApi = new NodeAPI(api);

    newApi.save(function(err){
        if (err) {
            log.error('Failed to create a new token', err);

            return res.status(400).send({
                message: err.message
            });
        }

        log.info('New token created!', { user: req.user, token: api });
        res.json(newApi);
    });
};

exports.register = function(req, res){
    let tokenData = req.body,
        address = '';

    tokenData.token = req.headers['X-Token'];

    if(!tokenData.token){
        return res.status(400).send({
            message: 'Incorrect or Missing Token'
        });
    }

    Object.keys(req.headers).some((key)=>{
        if (key.toLowerCase() === 'x-forwarded-for') {
            address = req.headers[key];
        }
    });

    NodeLink.findOne({ token: tokenData.token }).lean().exec((err, data)=>{
        if(err || !(data || {}).token){
            log.error('Token Registration failure', err || { message: 'Token was not found' });

            return res.status(400).send({
                message: 'Incorrect or Missing Token'
            });
        }

        data.address = address;
        res.jsonp(nodeComm.registerInit(data));
    });
};

exports.tokenById = function (req, res, next, id){
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Token id is invalid'
        });
    }

    NodeLink.findById(id).exec(function (err, token) {
        if(err){
            log.error('Error attempting to get token: ' + id, err);
            return next(err);
        }else if(!token) {
            return next(new Error('Failed to load link', id));
        }

        req.token = token;
        next();
    });
};
