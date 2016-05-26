'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    masterNode = require('./node.server.controller');

var outputs = masterNode.outputs,
    outputDrivers = masterNode.outputDrivers,
    outputDriverHash = masterNode.outputDriverHash,
    outputHash = masterNode.outputHash;

exports.list = function(req, res){
    res.json(outputs.map(function(output){
        return _.extend({ driver: masterNode.outputDriverHash[output.driverId] }, output); //Gives the driver as well as the output info
    }));
};

exports.listDrivers = function(req, res){
    res.json(outputDrivers);
};

exports.set = function (req, res){
    var output = req.output;
    var value = req.body ? req.body.value : undefined;
    var type = req.body ? req.body.type : undefined;

    var info = {
        url: 'http://' + output.node.ip + '/api/output/' + output.id + '/set',
        form: { value: value, type: type }
    };

    request.post(info, function (err, reqs, body){
        if(err){
            return res.status(400).send('Error attempting to set output');
        }

        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send(body || 'Unable to get new output config');
        }

        if(newOutput.name) output.name = newOutput.name;
        if(newOutput.location) output.location = newOutput.location;
        if(newOutput.description) output.description = newOutput.description;
        if(newOutput.config) output.config = newOutput.config;
        if(newOutput.driverId) output.driverId = newOutput.driverId;

        res.json(_.extend({ driver: masterNode.outputDriverHash[output.driverId] }, output));
    });
};

exports.get = function (req, res){
    res.json(_.extend({ driver: masterNode.outputDriverHash[req.output.driverId] }, req.output));
};

exports.getDriver = function (req, res){
    res.json(req.driver);
};


exports.update = function (req, res){
    var output = req.output,
        node = req.body.node,
        newNode = {};

    if(!_.isUndefined(node.name)) newNode.name = node.name;
    if(!_.isUndefined(node.location)) newNode.location = node.location;
    if(!_.isUndefined(node.description)) newNode.description = node.description;
    if(!_.isUndefined(node.driverId)) newNode.driverId = node.driverId;

    //Strip any config out that isn't suppose to be there, shouldn't be needed but nice to do.
    if(!_.isUndefined(node.config) && !_.isUndefined(node.driverId)){
        newNode.config = {};

        for(var key in outputDriverHash[node.driverId].config){
            if(!_.isUndefined(node.config[key])){
                newNode.config[key] = node.config[key];
            }
        }
    }

    var info = {
        url: 'http://' + output.node.ip + '/api/output/' + output.id,
        form: { output: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) return res.status(400).send('Error attempting to update output');
        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send(body || 'Unable to get updated output config');
        }

        if(!_.isUndefined(newOutput.name)) output.name = newOutput.name;
        if(!_.isUndefined(newOutput.location)) output.location = newOutput.location;
        if(!_.isUndefined(newOutput.description)) output.description = newOutput.description;
        if(!_.isUndefined(newOutput.config)) output.config = newOutput.config;
        if(!_.isUndefined(newOutput.driverId)) output.driverId = newOutput.driverId;

        res.json(_.extend({ driver: masterNode.outputDriverHash[output.driverId] }, output));
    });
};

exports.remove = function (req, res){
    var output = req.output;

    var info = {
        url: 'http://' + output.node.ip + '/api/output/' + output.id,
        form: {}
    };

    request.del(info, function (err){
        if(err){ return res.status(400).send('Error attempting to remove output'); }
        var index = outputs.indexOf(output);

        if(index !== -1){
            outputs.splice(index, 1);
            delete outputHash[output.id];
            return res.json(_.extend({ driver: masterNode.outputDriverHash[output.driverId] }, output));
        }

        return res.status(400).send('Error attempting to remove output from server memory');
    });
};

exports.add = function (req, res){
    var newOutput = {},
        node = req.node,
        newNode = req.body.output;

    if(!_.isUndefined(newNode.name)) newOutput.name = newNode.name;
    if(!_.isUndefined(newNode.location)) newOutput.location = newNode.location;
    if(!_.isUndefined(newNode.description)) newOutput.description = newNode.description;

    //Strip any config out that isn't suppose to be there, shouldn't be needed but nice to do.
    if(!_.isUndefined(newNode.config) && !_.isUndefined(newNode.driverId)){
        newOutput.driverId = newNode.driverId;
        newOutput.config = {};

        for(var key in outputDriverHash[newNode.driverId].config){
            if(!_.isUndefined(newNode.config[key])){
                newOutput.config[key] = newNode.config[key];
            }
        }
    }

    if(newOutput.driverId) {
        var info = {
            url: 'http://' + node.ip + '/api/output',
            form: { output: newOutput }
        };

        request.post(info, function (err, resq, body) {
            if (err) return res.status(400).send('Error attempting to add output');
            var newOutput, output = {};

            try{
                newOutput = JSON.parse(body);
            }catch(err){
                return res.status(400).send(body || 'Unable to get updated output config');
            }

            output.name = newOutput.name;
            output.location = newOutput.location;
            output.description = newOutput.description;
            output.id = newOutput.id;
            output.config = newOutput.config;
            output.driverId = newOutput.driverId;
            output.node = node;
            masterNode.registerOutput(output);
            res.json(_.extend({ driver: masterNode.outputDriverHash[output.driverId] }, output));
        });
    }else{
        return res.status(400).send('No output driver specified, cannot create configuration');
    }
};

exports.outputById = function (req, res, next, id){
    if(!(req.output = outputHash[id])){
        return res.status(400).send({
            message: 'Output id not found'
        });
    }

    return next();
};

exports.driverById = function (req, res, next, id){
    if(!(req.driver = outputDriverHash[id])){
        return res.status(400).send({
            message: 'Output driver id not found'
        });
    }

    return next();
};
