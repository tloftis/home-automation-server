'use strict';

var async = require('async'),
	_ = require('lodash'),
    request = require('request'),
    mongoose = require('mongoose'),
    NodeLink = mongoose.model('NodeLink'),
    masterNode = require('./node.server.controller');

var inputs = masterNode.inputs,
    inputDrivers = masterNode.inputDrivers,
    outputHash = masterNode.outputHash,
    inputDriverHash = masterNode.inputDriverHash,
    inputHash = masterNode.inputHash;

exports.list = function(req, res){
    res.json(inputs.map(function(input){
        return _.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input); //Gives the driver as well as the input info
    }));
};

exports.listDrivers = function(req, res){
    res.json(inputDrivers);
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

        for(var key in inputDriverHash[node.driverId].config){
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
        if(err) return res.status(400).send('Error attempting to update input');
        var newInput;

        try{
            newInput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get updated input config');
        }

        if(!_.isUndefined(newInput.name)) input.name = newInput.name;
        if(!_.isUndefined(newInput.location)) input.location = newInput.location;
        if(!_.isUndefined(newInput.description)) input.description = newInput.description;
        if(!_.isUndefined(newInput.config)) input.config = newInput.config;
        if(!_.isUndefined(newInput.driverId)) input.driverId = newInput.driverId;
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
        if(err) return res.status(400).send('Error attempting to remove input');

        index = inputs.indexOf(input);

        if(index !== -1){
            delete inputHash[input.id];
            inputs.splice(index, 1)[0];
            return res.json(_.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input));
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
    if(input.config) newInput.config = input.config;
    if(input.driverId) newInput.driverId = input.driverId;

    if(newInput.driverId){
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
                driverId: newInput.driverId,
                config: newInput.config,
                id: newInput.id,
                node: node
            };

            masterNode.registerInput(input);
            res.json(_.extend({ driver: masterNode.inputDriverHash[input.driverId] }, input)); //Gives the driver as well as the input info
        });
    }else{
        return res.status(400).send('No input driver specified, cannot create configuration');
    }
};

exports.change = function(req, res){
    var input = req.input,
        node = input.node,
        config = req.body;

    if(!input){
        return res.status(400).send("Unknown Input posted to server");
    }

    /* Going to need a lot of work to properly function and do so in a very configurable manner with pipes
    var query = {
            input: {
                nodeId: node.id
            }
        };

    NodeLink.find(query).exec(function(err, links){
        var output;

        if(err){
            return res.send("Error getting input to output links");
        }

        links = [
            {
                pipes:[
                    'asdfasdf', //Id linking to some pipe object
                    'asdfasdf' //Order Matters quite a bit, allowed to repeat
                ],
                output:{
                    id: "00:13:ef:86:05:29"
                }
            },
            {
                pipes: [], //Pipes aren't needed
                output:{
                    id: "00:13:ef:86:05:29"
                }
            }
        ];

        async.each(links, function(link, next){

            link.pipes.forEach(function(pipe){
                //config.value = getPipe(pipe)(config.value);
            });

            output = outputHash[link.output.id] || false;

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

            exports.setOutput({ output: output, body: {} }, fakeRes)
        });
    });
    */
};

exports.inputById = function (req, res, next, id){
    if(!(req.input = inputHash[id])){
        return res.status(400).send({
            message: 'Input id not found'
        });
    }

    return next();
};

exports.driverById = function (req, res, next, id){
    if(!(req.input = inputDriverHash[id])){
        return res.status(400).send({
            message: 'Input driver id not found'
        });
    }

    return next();
};
