'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    outputController = require('../controllers/node-outputs.server.controller.js'),
    NodeLink = mongoose.model('NodeLink'),
    masterNode = require('./node.server.controller'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

exports.list = function(req, res){
    res.json(masterNode.inputs.map(function(input){
        return _.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input); //Gives the driver as well as the input info
    }));
};

exports.get = function (req, res){
    res.json(_.extend({ driver: masterNode.inputDriverHash[req.input.driverId] }, req.input)); //Gives the driver as well as the input info
};

exports.update = function (req, res){
    var input = req.input,
        node = req.body.node,
        newNode = {};

    if(!_.isUndefined(node.name)) newNode.name = node.name;
    if(!_.isUndefined(node.location)) newNode.location = node.location;
    if(!_.isUndefined(node.description)) newNode.description = node.description;
    if(!_.isUndefined(node.driverId)) newNode.driverId = node.driverId;

    //Strip any config out that isn't suppose to be there, shouldn't be needed but nice to do.
    if(!_.isUndefined(node.config) && !_.isUndefined(node.driverId)){
        newNode.config = {};

        for(var key in masterNode.inputDriverHash[node.driverId].config){
            if(!_.isUndefined(node.config[key])){
                newNode.config[key] = node.config[key];
            }
        }
    }

    var info = {
        url: 'http://' + input.node.ip + '/api/input/' + input.id,
        form: { input: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) {
            input.node.active = false;
            log.error('Failed to update node: ' + node.ip + ', input:' + input.id, err);
            return res.status(400).send('Error attempting to update input');
        }

        var newInput;

        try{
            newInput = JSON.parse(body);
        }catch(err){
            return res.status(400).send(body || 'Unable to get updated input config');
        }

        if(!_.isUndefined(newInput.name)) input.name = newInput.name;
        if(!_.isUndefined(newInput.location)) input.location = newInput.location;
        if(!_.isUndefined(newInput.description)) input.description = newInput.description;
        if(!_.isUndefined(newInput.config)) input.config = newInput.config;
        if(!_.isUndefined(newInput.driverId)) input.driverId = newInput.driverId;
        node.active = true;
        log.info('Updated input config on node: ' + input.node.ip, input);
        res.json(_.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input)); //Gives the driver as well as the input info
    });
};

exports.remove = function (req, res){
    var input = req.input,
        index = -1;

    var info = {
        url: 'http://' + input.node.ip + '/api/input/' + input.id,
        form: {}
    };

    request.del(info, function (err){
        if(err){
            input.node.active = false;
            log.error('Failed to delete on node: ' + node.ip + ', input:' + input.id, err);
            return res.status(400).send('Error attempting to remove input');
        }

        index = masterNode.inputs.indexOf(input);

        if(index !== -1){
            delete masterNode.inputHash[input.id];
            masterNode.inputs.splice(index, 1);
            input.node.active = true;
            return res.json(_.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input));
        }

        log.info('Deleted input on node: ' + input.node.ip, input);
        return res.status(400).send('Error attempting to remove input from server memory');
    });
};

exports.add = function (req, res){
    var newInput = {},
        node = req.node,
        newNode = req.body.input;

    if(!_.isUndefined(newNode.name)) newInput.name = newNode.name;
    if(!_.isUndefined(newNode.location)) newInput.location = newNode.location;
    if(!_.isUndefined(newNode.description)) newInput.description = newNode.description;

    //Strip any config out that isn't suppose to be there, shouldn't be needed but nice to do.
    if(!_.isUndefined(newNode.driverId)){
        newInput.driverId = newNode.driverId;
    }

    if(!_.isUndefined(newNode.config)){
        newInput.config = {};

        for(var key in masterNode.inputDriverHash[newNode.driverId].config){
            if(!_.isUndefined(newNode.config[key])){
                newInput.config[key] = newNode.config[key];
            }
        }
    }

    if(newInput.driverId){
        var info = {
            url: 'http://' + node.ip + '/api/input',
            form: { input: newInput }
        };

        request.post(info, function (err, resq, body) {
            if(err){
                node.active = false;
                log.error('Failed to add input on node: ' + node.ip, err);
                return res.status(400).send('Error attempting to add input');
            }

            var newInput, input = {};

            try{
                newInput = JSON.parse(body);
            }catch(err){
                return res.status(400).send('Unable to get updated input config');
            }

            input.name = newInput.name;
            input.location = newInput.location;
            input.description = newInput.description;
            input.id = newInput.id;
            input.config = newInput.config;
            input.driverId = newInput.driverId;
            input.node = node;
            input.node.active = true;
            masterNode.registerInput(input);
            log.info('Created new input on node: ' + input.node.ip, input);
            res.json(_.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input));
        });
    }else{
        return res.status(400).send('No input driver specified, cannot create configuration');
    }
};

exports.change = function(req, res){
    var input = req.input,
        value = req.body.value,
        type = req.body.type;

    input.node.active = true;

    if(!type){
        res.status(400).jsonp({
            message:'Update Failed!'
        });
    }

    if(type === 'boolean'){
        if(value.toLowerCase() === 'true'){ value = true; }
        if(value.toLowerCase() === 'false'){ value = false; }

        value = value ? true : false;
    }

    if(type === 'number'){
        value = +value;
    }

    if(type === 'string'){
        value += '';
    }

    if(!input){
        return res.status(400).send('Unknown Input posted to server');
    }

    log.info('Input Change ID: "' + input.id + '" Value: ' + value + ', Type: ' + type, input);

    res.status(200).jsonp({
        message:'Update Succeeded!'
    });
};

exports.inputById = function (req, res, next, id){
    if(!(req.input = masterNode.inputHash[id])){
        return res.status(400).send({
            message: 'Input id not found'
        });
    }

    return next();
};
