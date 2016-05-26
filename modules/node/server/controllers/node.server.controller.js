'use strict';

//Only can find address in a subnet mask of 255.255.255.0
var async = require('async'),
	request = require('request'),
    os = require('os'),
    testAddresses = [];

var nodes = [],
    outputs = [],
    inputs = [],

    outputDrivers = [],
    inputDrivers = [],

    inputDriverHash = {},
    outputDriverHash = {},

    nodeHash = {},
    outputHash = {},
    inputHash = {};

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
                    var newNode = {
                        id: node.id,
                        ip: address,
                        name: node.name || '',
                        description: node.description || '',
                        location: node.location || ''
                    };

                    nodes.push(newNode);
                    nodeHash[node.id] = newNode;
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
                        location: input.location,
                        description: input.description,
                        driverId: input.driverId,
                        config: input.config,
                        id: input.id,
                        node: node
                    };

                    inputs.push(input);
                    inputHash[input.id] = input;
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
                        driverId: output.driverId,
                        config: output.config,
                        id: output.id,
                        node: node
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

function updateDrivers(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        async.parallel([function(nextMid){
            request.get('http://' + node.ip + '/api/output/drivers', function (err, res, body){
                var newDrivers;

                try {
                    newDrivers = JSON.parse(body);
                } catch (err){
                    return nextMid();
                }

                if(err){
                    return nextMid();
                }else{
                    async.each(newDrivers, function (driver, next){
                        var driver = {
                            name: driver.name,
                            location: driver.location,
                            description: driver.description,
                            type: driver.type,
                            config: driver.config,
                            id: driver.id,
                            node: node
                        };

                        outputDrivers.push(driver);
                        outputDriverHash[driver.id] = driver;
                        next();
                    },function(){
                        nextMid();
                    });
                }
            });
        }, function(nextMid){
            request.get('http://' + node.ip + '/api/input/drivers', function (err, res, body){
                var newDrivers;

                try {
                    newDrivers = JSON.parse(body);
                } catch (err){
                    return nextMid();
                }

                if(err){
                    return nextMid();
                }else{
                    async.each(newDrivers, function (driver, next){
                        var driver = {
                            name: driver.name,
                            type: driver.location,
                            description: driver.description,
                            config: driver.config,
                            id: driver.id,
                            node: node
                        };

                        inputDrivers.push(driver);
                        inputDriverHash[driver.id] = driver;
                        next();
                    },function(){
                        nextMid();
                    });
                }
            });
        }], function(){
            nextMain();
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

                    updateDrivers(function(){
                        console.log('Updated Drivers');
                        /*
                        var i, len;

                        for(i = 0, len = inputs.length; i < len; i++){
                            inputs[i].driver = inputDriverHash[inputs[i].driverId];
                        }

                        for(i = 0, len = outputs.length; i < len; i++){
                            outputs[i].driver = outputDriverHash[outputs[i].driverId];
                        }
                        */
                    });
                });
            });
        })
    });
}

updateAll();
exports.nodes = nodes;
exports.outputs = outputs;
exports.inputs = inputs;
exports.outputDrivers = outputDrivers;
exports.inputDrivers = inputDrivers;
exports.outputDriverHash = outputDriverHash;
exports.inputDriverHash = inputDriverHash;
exports.nodeHash = nodeHash;
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
    if(req.node = nodeHash[id]){ return next(); }

    return res.status(400).send({
        message: 'Node could not be found'
    });
};

//Used to register new node input and output, adds to array and gives them new ids
exports.registerInput = function(config){
    inputs.push(config);
    inputHash[config.id] = config;
};

exports.registerOutput = function(config){
    outputs.push(config);
    outputHash[config.id] = config;
};
