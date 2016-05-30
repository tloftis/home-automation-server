'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    NodeLink = mongoose.model('NodeLink'),
    masterNode = require('./node.server.controller');

var outputHash = masterNode.outputHash,
    inputHash = masterNode.inputHash;

exports.list = function(req, res){
    NodeLink.find({}).lean().exec(function(err, links){
        res.json(links.map(function(link){
            return _.extend({
                input: masterNode.inputHash[link.inputId],
                output: masterNode.outputHash[link.outputId]
            }, link);
        }));
    });
};

exports.get = function (req, res){
    var link = req.link._doc;

    res.json(_.extend({
        input: masterNode.inputHash[req.link.inputId],
        output: masterNode.outputHash[req.link.outputId]
    }, link));
};

exports.getPipes = function (req, res){
    res.json(masterNode.pipes);
};

exports.remove = function (req, res){
    var link = req.link;

    link.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: err.message
            });
        }

        res.json(link);
    });
};

exports.update = function (req, res){
    var link = req.link,
        addLink = req.body.link;

    if(addLink.inputId && inputHash[addLink.inputId]){ link.inputId = addLink.inputId; }
    if(addLink.outputId && outputHash[addLink.outputId]){ link.outputId = addLink.outputId; }
    if(addLink.description){ link.description = addLink.description; }

    if(addLink.pipes && addLink.pipes instanceof Array){
        link.pipes = addLink.pipes.map(function(pipe){
            return { pipeId: pipe.id, data: pipe.data }
        });

        link.markModified('pipes');
    }

    return link.save(function(err){
        if (err) {
            return res.status(400).send({
                message: err.message
            });
        }

        res.json(link);
    });
};

exports.add = function (req, res){
    var newLink = {},
        addLink = req.body.link;

    if(addLink.inputId && addLink.outputId && inputHash[addLink.inputId] && outputHash[addLink.outputId]){
        newLink.inputId = addLink.inputId;
        newLink.outputId = addLink.outputId;
        newLink.description = (addLink.description+'' || '');

        if(addLink.pipes && addLink.pipes instanceof Array){
            newLink.pipes = addLink.pipes;
        }

        var link = new NodeLink(newLink);

        return link.save(function(err){
            if (err) {
                return res.status(400).send({
                    message: err.message
                });
            }

            res.json(link);
        });
    }

    return res.status(400).send({
        message: 'Invalid configuration for a link'
    });
};

exports.linkById = function (req, res, next, id){
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Link id is invalid'
        });
    }

    NodeLink.findById(id).exec(function (err, link) {
        if(err){
            return next(err);
        }else if(!link) {
            return next(new Error('Failed to load link', id));
        }

        req.link = link;
        next();
    });
};
