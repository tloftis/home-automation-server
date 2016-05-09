'use strict';

//Only can find address in a subnet mask of 255.255.255.0
var async = require('async'),
	request = require('request'),
    os = require('os'),
    testAddresses = [];

var nodes = [],
    outputs = [],
    inputs = [],
    outputHash = {},
    inputHash = {};

//Used to generate unique id's for nodes inputs and outputs as a whole regardless of what node they are on
var outputIdItter = 1,
    inputIdItter = 1;

var netMask, localIp;
var interfaces = os.networkInterfaces();

for (var j in interfaces){
    for (var i in interfaces[j]){
        var address = interfaces[j][i];

        if (address.family === 'IPv4' && !address.internal){
            netMask = address.netmask;
            localIp = address.address;
        }
    }
}

var end = 0; //because this is the best option
var ipIntro = '10.0.0.'; //because it's my default network

if(netMask){
    end = +netMask.split('.').pop();
}

if(localIp){
    var ipArr = localIp.split('.');
    ipArr.pop();
    ipIntro = ipArr.join('.') + '.';
}

for(i = end; i <= 255; i++){
    testAddresses.push(ipIntro + i + ':' + (process.env.RELAY_PORT || 2000));
}

//This looks at all address on the local net. If a node is found it is added to the database if not already in the database
function searchForNodes(callback){
    if(!callback) callback = function(){};

    async.each(testAddresses, function (address, next){
        var info = {
            url: 'http://' + address + '/api/server',
            timeout: 2000
        };

        request.get(info, function (err, res, body){
            if (!err && body){
                var node;

                //parse out the info gained back from the server
                try {
                    node = JSON.parse(body);
                }catch(err){
                    return next();
                }

                if(node && (node.id !== '')){
                    nodes.push({
                        id: node.id,
                        ip: address,
                        name: node.name | '',
                        description: node.description | '',
                        location: node.location | ''
                    });
                }
            }

            next();
        });
    }, function (){
        callback();
    });
}

function registerWithNodes(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, next){
        var info = {
            url: 'http://' + node.ip + '/api/register',
            form: {}
        };

        request.post(info, function (){
            next();
        });
    }, callback);
}

function updateInputs(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        request.get('http://' + node.ip + '/api/input', function (err, res, body){
            var newInputs;

            try {
                newInputs = JSON.parse(body);
            } catch (err){
                return nextMain();
            }

            if(err){
                return nextMain();
            }else{
                async.each(newInputs, function (input, next){
                    var input = {
                        name: input.name,
                        location: input.location || '',
                        description: input.description || '',
                        pin: input.pin,
                        state: (+input.val === 1),
                        invState: (+input.invVal === 1),
                        node: node,
                        id: input.id
                    };

                    inputs.push(input);
                    inputHash[input.pin] = input;
                    next()
                },function(){
                    nextMain();
                });
            }
        });
    }, callback);
}

function updateOutputs(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        request.get('http://' + node.ip + '/api/output', function (err, res, body){
            var newOutputs;

            try {
                newOutputs = JSON.parse(body);
            } catch (err){
                return nextMain();
            }

            if(err){
                return nextMain();
            }else{
                async.each(newOutputs, function (output, next){
                    var output = {
                        name: output.name,
                        location: output.location,
                        description: output.description,
                        pin: output.pin,
                        state: (+output.val === 1),
                        node: node,
                        id: output.id
                    };

                    outputs.push(output);
                    outputHash[output.id] = output;
                    next()
                },function(){
                    nextMain();
                });
            }
        });
    }, callback);
}

function updateAll(){
    searchForNodes(function(){
        console.log('Updated Nodes');

        registerWithNodes(function(){
            console.log('Registered Nodes');

            updateInputs(function(){
                console.log('Updated Inputs');

                updateOutputs(function(){
                    console.log('Updated Outputs');
                });
            });
        })
    });
}

updateAll();

exports.nodes = nodes;
exports.outputs = outputs;
exports.inputs = inputs;

exports.inputHash = inputHash;
exports.outputHash = outputHash;

exports.list = function(req, res){
    res.json(nodes);
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
        url: 'http://' + selNode.ip + '/api/server',
        form: { node: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) return res.status(400).send('Error attempting to update node server config');
        var newOutput;

        try{
            newOutput = JSON.parse(body);
        }catch(err){
            return res.status(400).send('Unable to get updated node server configuration');
        }

        selNode.description = newOutput.description;
        selNode.location = newOutput.location;
        selNode.name = newOutput.name;
        res.json(selNode);
    });
};

exports.nodeById = function (req, res, next, id){
    var node;
    var macPatt = new RegExp('^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');

    if (!macPatt.test(id)){
        return res.status(400).send({
            message: 'Node id ' + id + ' is invalid'
        });
    }

    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];

        if(node.id === id){
            req.node = node;
            return next();
        }
    }

    return res.status(400).send({
        message: 'Node could not be found'
    });
};

//used to check the validity of a id for a input or output
exports.outputIdValid = function(id) {
    return !(id === 0 || id >= outputIdItter || id < (outputs.length - outputIdItter));
};

exports.inputIdValid = function(id) {
    return !(id === 0 || id >= inputIdItter || id < (outputs.length - inputIdItter));
};

//Used to register new node input and output, adds to array and gives them new ids
exports.registerInput = function(config){
    config.id = inputIdItter++;
    inputs.push(config);
};

exports.registerOutput = function(config){
    config.id = outputIdItter++;
    outputs.push(config);
};
