'use strict';

var async = require('async'),
	_ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    NodeLink = mongoose.model('NodeLink'),
    masterNode = require('./node.server.controller');

var inputs = masterNode.inputs,
    nodeOutput = masterNode.nodeOutput,
    nodeInput = masterNode.nodeInput;

exports.list = function(req, res){
    res.json(inputs);
};

exports.get = function (req, res){
    res.json(req.input);
};

exports.update = function (req, res){
    var input = req.input,
        node = req.body.node,
        newNode = {};

    if(node.name) newNode.name = node.name;
    if(node.location) newNode.location = node.location;
    if(node.description) newNode.description = node.description;
    if(!_.isUndefined(node.invState)) newNode.invVal = +node.invState;
    if(node.pin) newNode.pin = node.pin;

    var info = {
        url: 'http://' + input.node.ip + '/api/input/' + input.pin,
        form: { input: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) return res.status(400).send('Error attempting to update input');
        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get updated input config');
        }

        input.state = (+newOutput.val === 1);
        input.invState = (+newOutput.invVal === 1);
        input.description = newOutput.description;
        input.location = newOutput.location;
        input.name = newOutput.name;
        input.pin = newOutput.pin;
        res.json(input);
    });
};

exports.remove = function (req, res){
    var input = req.input,
        index = -1;

    var info = {
        url: 'http://' + input.node.ip + '/api/input/' + input.pin,
        form: {}
    };

    request.del(info, function (err){
        if(err) return res.status(400).send('Error attempting to remove input');

        index = inputs.indexOf(input);

        if(index !== -1){
            inputs.splice(index, 1);
            return res.json(input);
        }

        return res.status(400).send('Error attempting to remove input from server memory');
    });
};

exports.add = function (req, res){
    var newInput = { val: 0 },
        node = req.node,
        input = req.body.input;

    if(input.name) newInput.name = input.name;
    if(input.location) newInput.location = input.location;
    if(input.description) newInput.description = input.description;
    if(input.invState) newInput.invVal = input.invState;

    if(input.pin) {
        newInput.pin = input.pin;

        var info = {
            url: 'http://' + node.ip + '/api/input',
            form: { input: newInput }
        };

        request.post(info, function (err, resq, body) {
            if (err) return res.status(400).send('Error attempting to add input');
            var newInput;

            try{
                newInput = JSON.parse(body);
            }catch(err){
                return res.status(400).send('Unable to get new input config');
            }

            input = {
                name: newInput.name,
                location: newInput.location,
                description: newInput.description,
                pin: newInput.pin,
                state: (+newInput.val === 1),
                invState: (+newInput.invVal === 1),
                node: node
            };

            masterNode.registerInput(input);
            return res.json(input);
        });
    }else{
        return res.status(400).send('No input pin specified, cannot create configuration');
    }
};

exports.change = function(req, res){
    var input,
        givenInput = req.body.config,
        node = req.node;

    if(!givenInput.pin){
        return res.status(400).send("No pin given with update");
    }

    input = nodeInput[node.id] ? nodeInput[node.id][+givenInput.pin] : undefined;

    if(!input){
        return res.status(400).send("Unable to update pin");
    }

    res.send("Not yet implemented");

    if(givenInput.description){
        input.descrption = givenInput.description;
    }
    if(givenInput.name){
        input.name = givenInput.name;
    }
    if(givenInput.location){
        input.location = givenInput.location;
    }
    if(givenInput.val){
        input.state = (+givenInput.val === 1);
    }
    if(givenInput.invVal){
        input.invState = (+givenInput.invVal === 1);
    }

    var query = {
            input: {
                nodeId: node.id,
                pin: input.pin
            }
        };

    console.log(input);

    NodeLink.find(query).exec(function(err, links){
        var output;

        if(err){
            return res.send("Error getting input to output links");
        }

        links = [
            {
                output:{
                    nodeId: "04:8d:38:c8:fe:f2",
                    pin: 2
                },
                connectionType: 0
            },
            {
                output:{
                    nodeId: "00:13:ef:86:05:29",
                    pin: 3
                },
                connectionType: 1
            },
            {
                output:{
                    nodeId: "00:13:ef:86:05:29",
                    pin: 2
                },
                connectionType: 2
            }
        ];

        async.each(links, function(link, next){
            output = nodeOutput[link.output.nodeId] ? nodeOutput[link.output.nodeId][link.output.pin] : false;

            if(!output){
                return next();
            }

            var callNext = function(){
                next();
            };

            var fakeRes = {
                send: callNext,
                json: callNext,
                status: function(){
                    return fakeRes;
                }
            };

            if(+link.connectionType === 2){
                exports.setOutput({ output: output, body: {} }, fakeRes)
            }else{
                if(+input.state === +link.connectionType) {
                    exports.setOutput({ output: output, body: {} }, fakeRes)
                }
            }
        });
    });
};

exports.inputById = function (req, res, next, id){
    id = +id;
    var input;

    if(!masterNode.inputIdValid(id)){
        return res.status(400).send({
            message: 'Input id is invalid'
        });
    }

    for(var i = 0; i < inputs.length; i++){
        input = inputs[i];

        if(+input.id === id){
            req.input = input;
            return next();
        }
    }

    return res.status(400).send({
        message: 'Input could not be found'
    });
};
