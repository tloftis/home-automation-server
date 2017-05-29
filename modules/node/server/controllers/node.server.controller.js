'use strict';

//Only can find address in a subnet mask of 255.255.255.0
var _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    fs = require('fs'),
    os = require('os'),
    nodeComm = rootRequire('./modules/node/server/lib/node-communication.js'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

exports.updateNodes = function(req, res){
    nodeComm.updateAll(function(){
        res.send('Update Complete!');
    });
};

exports.updateNode = function(req, res){
    var node = req.node;

    if(!node){
        return res.status(400).send('Error attempting to update node!');
    }

    async.parallel([
        function(done){
            nodeComm.updateNodeDrivers(node, done);
        },
        function(done){
            nodeComm.updateNodeOutputs(node, done);
        },
        function(done){
            nodeComm.updateNodeInputs(node, done);
        }
    ], function(){
        log.info('Node added back to system!', node);
        res.send('Node Updated!');
    })
};

exports.list = function(req, res){
    res.json(nodeComm.nodes);
};

exports.get = function (req, res){
    res.json(req.node);
};

exports.update = function (req, res){
    var node = req.body.node,
        selNode = req.node,
        newNode = {};

    if(node.name) newNode.name = node.name;
    if(node.location) newNode.location = node.location;
    if(node.description) newNode.description = node.description;

    var info = {
        headers: {
            'X-Token': node.serverToken
        },
        url: 'http://' + selNode.ip + '/api/server',
        form: { node: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) {
            node.active = false;
            log.error('Failed to update config of node: ' + node.ip, err);
            return res.status(400).send('Error attempting to update node server config');
        }

        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get updated node server configuration');
        }

        selNode.description = newOutput.description;
        selNode.location = newOutput.location;
        selNode.name = newOutput.name;
        selNode.active = true;
        res.json(selNode);
    });
};

exports.nodeById = function (req, res, next, id){
    req.node = nodeComm.nodeHash[id];
    if(req.node){ return next(); }

    return res.status(400).send({
        message: 'Node could not be found'
    });
};
