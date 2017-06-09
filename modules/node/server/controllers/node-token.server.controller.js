'use strict';

let async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    NodeToken = mongoose.model('NodeToken'),
    crypto = require('crypto'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

function genId() {
    return crypto.randomBytes(40).toString('hex');
}

exports.list = function(req, res) {
    NodeToken.find({}).lean().exec(function(err, tokens) {
        if (err) {
            log.error('Failed to get tokens', err);

            return res.status(400).send({
                message: err.message
            });
        }

        res.json(tokens || []);
    });
};

exports.get = function (req, res) {
    res.json(req.token);
};

exports.update = function (req, res) {
    let token = req.token,
        newToken = (req.body || {}).token;

    token.enabled = !!(newToken || {}).enabled;
    token.description = newToken.description || token.description;
    token.name = newToken.name || token.name;

    return token.save(function(err) {
        if (err) {
            log.error('Failed to update token: ' + token.token + ', id:' + token._id, err);

            return res.status(400).send({
                message: err.message
            });
        }

        log.info('Updated token: ' + token.token + ', id:' + token._id, token);
        res.json(token);
    });
};

exports.remove = function (req, res) {
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

exports.create = function (req, res) {
    let token = (req.body || {}).token || {};

    token.token = genId();
    token.enabled = false;

    let newToken = new NodeToken(token);

    newToken.save(function(err) {
        if (err) {
            log.error('Failed to create a new token', err);

            return res.status(400).send({
                message: err.message
            });
        }

        log.info('New token created!', { user: req.user, token: newToken });
        res.json(newToken);
    });
};

exports.tokenById = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Token id is invalid'
        });
    }

    NodeToken.findById(id).exec(function (err, token) {
        if (err) {
            log.error('Error attempting to get token: ' + id, err);
            return next(err);
        } else if (!token) {
            return next(new Error('Failed to load Token', id));
        }

        req.token = token;
        next();
    });
};
