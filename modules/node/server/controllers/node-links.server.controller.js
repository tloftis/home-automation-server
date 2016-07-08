'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    NodeLink = mongoose.model('NodeLink'),
    masterNode = require('./node.server.controller');

function verifyPipe(inType, outType, pipes){
    var currentType, finalType, pipe;

    if(inType){
        if(inType instanceof Array){
            currentType = inType;
        }else if(typeof inType === 'string'){
            currentType = [inType];
        }
    }

    if(!currentType){ return false; }

    if(outType){
        if(outType instanceof Array){
            finalType = outType;
        }else if(typeof outType === 'string'){
            finalType = [outType];
        }
    }

    if(!finalType){ return false; }

    var typeTester = function(inType, outType) {
        return (inType || []).some(function(item){
            return (outType || []).indexOf(item) !== -1;
        })
    };

    if(pipes){
        for(var j = 0; j < pipes.length; j++){
            pipe = masterNode.pipeHash[pipes[j].pipeId];
            pipe.inType = (pipe.inType instanceof Array) ? pipe.inType : [pipe.inType];

            if(!typeTester(pipe.inType, currentType)){
                return false;
            }else{
                currentType = pipe.inType;
            }
        }
    }

    return typeTester(finalType, currentType);
}

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

exports.get = function(req, res){
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
        addLink = req.body.link,
        input = masterNode.inputHash[addLink.inputId],
        output = masterNode.outputHash[addLink.outputId];

    if(addLink.inputId && input){ link.inputId = addLink.inputId; }
    if(addLink.outputId && output){ link.outputId = addLink.outputId; }
    if(addLink.description){ link.description = addLink.description; }

    if(addLink.pipes && addLink.pipes instanceof Array){
        link.pipes = addLink.pipes.map(function(pipe){
            return { pipeId: pipe.pipeId, data: pipe.data }
        });

        link.markModified('pipes');
    }

    /*
    if(!verifyPipe((inputDriverHash[input.driverId] || {}).type, (outputDriverHash[output.driverId] || {}).type, link.pipes)){
        return res.status(400).send({
            message: 'Type mismatch somewhere in path from input to output!'
        });
    }
    */

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

    if(addLink.inputId && addLink.outputId && masterNode.inputHash[addLink.inputId] && masterNode.outputHash[addLink.outputId]){
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
