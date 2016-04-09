'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    masterNode = require('./node.server.controller');

var outputs = masterNode.outputs,
    nodeOutput = masterNode.nodeOutput;

exports.list = function(req, res){
    res.json(outputs);
};

exports.set = function (req, res){
    var output = req.output;
    var node = output.node;

    var info = {
        url: 'http://' + node.ip + '/api/output/set',
        form: { pin: output.pin }
    };

    if (!_.isUndefined(req.body.val)){
        info.form.val = +req.body.val;
    }

    request.post(info, function (err, reqs, body){
        if(err){
            return res.status(400).send('Error attempting to set output');
        }

        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get new output config');
        }

        output.state = (newOutput.val === 1);
        res.json(output);
    });
};

exports.get = function (req, res){
    res.json(req.output);
};

exports.update = function (req, res){
    var output = req.output,
        node = req.body.node,
        newNode = {};

    if(node.name) newNode.name = node.name;
    if(node.location) newNode.location = node.location;
    if(node.description) newNode.description = node.description;
    if(node.pin) newNode.pin = node.pin;

    var info = {
        url: 'http://' + output.node.ip + '/api/output/' + output.pin,
        form: { output: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) return res.status(400).send('Error attempting to update output');
        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get updated output config');
        }

        output.state = (newOutput.val === 1);
        output.description = newOutput.description;
        output.location = newOutput.location;
        output.name = newOutput.name;
        output.pin = newOutput.pin;

        res.json(output);
    });
};

exports.remove = function (req, res){
    var output = req.output,
        index = -1;

    var info = {
        url: 'http://' + output.node.ip + '/api/output/' + output.pin,
        form: {}
    };

    request.del(info, function (err){
        if(err) return res.status(400).send('Error attempting to remove output');

        index = outputs.indexOf(output);

        if(index !== -1){
            outputs.splice(index, 1);
            return res.json(output);
        }

        return res.status(400).send('Error attempting to remove output from server memory');
    });
};

exports.add = function (req, res){
    var newOutput = { val: 0 },
        node = req.node,
        output = req.body.output;

    if(output.name) newOutput.name = output.name;
    if(output.location) newOutput.location = output.location;
    if(output.description) newOutput.description = output.description;
    if(output.state) newOutput.val = +output.state;

    if(output.pin) {
        newOutput.pin = output.pin;

        var info = {
            url: 'http://' + node.ip + '/api/output',
            form: { output: newOutput }
        };

        request.post(info, function (err, resq, body) {
            if (err) return res.status(400).send('Error attempting to add output');
            var newOutput;

            try{
                newOutput = JSON.parse(body);
            }catch(err){
                return res.status(400).send('Unable to get new output config');
            }

            output = {
                name: newOutput.name,
                location: newOutput.location,
                description: newOutput.description,
                pin: newOutput.pin,
                state: (+newOutput.val === 1),
                node: node
            };

            masterNode.registerOutput(output);
            return res.json(output);
        });
    }else{
        return res.status(400).send('No output pin specified, cannot create configuration');
    }
};

exports.outputById = function (req, res, next, id){
    id = +id;
    var output;

    if(!masterNode.outputIdValid(id)){
        return res.status(400).send({
            message: 'Output id is invalid'
        });
    }

    for(var i = 0; i < outputs.length; i++){
        output = outputs[i];

        if(+output.id === id){
            req.output = output;
            return next();
        }
    }

    return res.status(400).send({
        message: 'Output could not be found'
    });
};
