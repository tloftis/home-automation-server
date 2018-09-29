'use strict';

//Only can find address in a subnet mask of 255.255.255.0
const _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    fs = require('fs'),
    os = require('os'),
    testAddresses = [],
    log = rootRequire('./modules/core/controllers/log.server.controller.js');

let nodes = [],
    outputs = [],
    inputs = [],
    inputDriverHash = {},
    outputDriverHash = {},
    nodeHash = {},
    outputHash = {},
    inputHash = {};

let netMask, localIp;
let interfaces = os.networkInterfaces();

for (let j in interfaces){
    for (let i in interfaces[j]){
        let address = (interfaces[j] || {})[i] || {};

        if (address.family === 'IPv4' && !address.internal){
            netMask = address.netmask;
            localIp = address.address;
        }
    }
}

let end = 0; //because this is the best option
let ipIntro = '192.168.1.'; //because it's my default network

if(netMask){
    end = +netMask.split('.').pop();
}

if(localIp){
    let ipArr = localIp.split('.');
    ipArr.pop();
    ipIntro = ipArr.join('.') + '.';
}

for(let i = end; i <= 255; i++){
    testAddresses.push(ipIntro + i + ':' + (process.env.RELAY_PORT || 2000));
}

//This looks at all address on the local net. If a node is found it is added to the database if not already in the database
function searchForNodes(callback){
    if(!callback) callback = function(){};

    async.each(testAddresses, function (address, next){
        let info = {
            url: 'http://' + address + '/api/server',
            timeout: 2000
        };

        request.get(info, function (err, res, body){
            if (!err && body){
                let node;

                //parse out the info gained back from the server
                try {
                    node = JSON.parse(body);
                }catch(err){
                    return next();
                }

                Object.keys(nodeHash).forEach(()=>nodeHash[k].active=false);

                if(node && (node.id !== '')){
                    let newNode = {
                        id: node.id,
                        ip: address,
                        name: node.name || '',
                        description: node.description || '',
                        location: node.location || '',
                        inputDrivers : [],
                        outputDrivers : [],
                        active: true
                    };

                    nodeHash[node.id] = newNode;
                }
            }

            next();
        });
    }, function (){
        module.exports.nodeHash = nodeHash;
        module.exports.nodes = nodes = Object.keys(nodeHash).map(k=>nodeHash[k]);

        nodes.forEach(n=>{
            if(!node.active){
                log.error('Failed to to connect to node: ' + n.ip, n);
            }
        });
        callback();
    });
}

function registerWithNode(node, callback){
    if(!callback) callback = function(){};

    let info = {
        url: 'http://' + node.ip + '/api/register',
        form: {}
    };

    request.post(info, function (){
        callback();
    });
}

function registerWithNodes(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, next){
        registerWithNode(node, next);
    }, callback);
}

function updateNodeInputs(node, callback){
    if(!callback) callback = function(){};

    request.get('http://' + node.ip + '/api/input', function (err, res, body){
        let newInputs;

        try {
            newInputs = JSON.parse(body);
        } catch (err){
            return callback();
        }

        if(err){
            node.active = false;
            return callback();
        }else{
            node.active = true;
            inputs = inputs.filter((input)=>{
                if(input.node.id === node.id){
                    delete inputHash[input.id];
                    return false;
                }

                return true;
            });

            async.each(newInputs, function (input, next){
                let newInput = {
                    name: input.name,
                    location: input.location,
                    description: input.description,
                    driverId: input.driverId,
                    config: input.config,
                    id: input.id,
                    node: node
                };

                inputs.push(newInput);
                inputHash[newInput.id] = newInput;
                next();
            },function(){
                module.exports.inputs = inputs;
                module.exports.inputHash = inputHash;
                callback();
            });
        }
    });
}

function updateInputs(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        updateNodeInputs(node, nextMain);
    }, callback);
}

function updateNodeOutputs(node, callback){
    if(!callback) callback = function(){};

    request.get('http://' + node.ip + '/api/output', function (err, res, body){
        let newOutputs;

        try {
            newOutputs = JSON.parse(body);
        } catch (err){
            return callback();
        }

        if(err){
            node.active = false;
            return callback();
        }else{
            node.active = true;
            outputs = outputs.filter((output)=>{
                if(output.node.id === node.id){
                    delete outputHash[output.id];
                    return false;
                }

                return true;
            });

            async.each(newOutputs, function (output, next){
                let newOutput = {
                    name: output.name,
                    location: output.location,
                    description: output.description,
                    driverId: output.driverId,
                    config: output.config,
                    id: output.id,
                    node: node
                };

                outputs.push(newOutput);
                outputHash[newOutput.id] = newOutput;
                next();
            },function(){
                module.exports.outputs = outputs;
                module.exports.outputHash = outputHash;
                callback();
            });
        }
    });
}

function updateOutputs(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        updateNodeOutputs(node, nextMain)
    }, callback);
}

function updateNodeDrivers(node, callback){
    if(!callback) callback = function(){};

    async.parallel([function(nextMid){
        request.get('http://' + node.ip + '/api/output/drivers', function (err, res, body){
            let newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return nextMid();
            }

            if(err){
                node.active = false;
                return nextMid();
            }else{
                node.active = true;
                node.outputDrivers = (node.outputDrivers || []).filter((outputDriver)=>{
                    if(node.outputDrivers.indexOf(outputDriver) !== -1){
                        delete outputDriverHash[outputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function (driver, next){
                    let newDriver = {
                        name: driver.name,
                        location: driver.location,
                        description: driver.description,
                        type: driver.type,
                        config: driver.config,
                        node: node,
                        id: driver.id
                    };

                    node.outputDrivers.push(newDriver);
                    node.active = true;
                    outputDriverHash[newDriver.id] = newDriver;
                    next();
                },function(){
                    module.exports.outputDrivers = outputDrivers;
                    module.exports.outputDriverHash = outputDriverHash;
                    nextMid();
                });
            }
        });
    }, function(nextMid){
        request.get('http://' + node.ip + '/api/input/drivers', function (err, res, body){
            let newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return nextMid();
            }

            if(err){
                node.active = false;
                return nextMid();
            }else{
                node.active = true;

                node.inputDrivers = (node.inputDrivers || []).filter((inputDriver)=>{
                    if(node.inputDrivers.indexOf(inputDriver) !== -1){
                        delete inputDriverHash[inputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function (driver, next){
                    let newDriver = {
                        name: driver.name,
                        location: driver.location,
                        description: driver.description,
                        type: driver.type,
                        config: driver.config,
                        node: node,
                        id: driver.id
                    };

                    node.inputDrivers.push(newDriver);
                    inputDriverHash[newDriver.id] = newDriver;
                    next();
                },function(){
                    module.exports.inputDrivers = inputDrivers;
                    module.exports.inputDriverHash = inputDriverHash;
                    nextMid();
                });
            }
        });
    }], function(){
        callback();
    });
}

function updateDrivers(callback){
    if(!callback) callback = function(){};

    async.each(nodes, function (node, nextMain){
        updateNodeDrivers(node, nextMain);
    }, callback);
}

function updateAll(callback){
    outputs = [];
    inputs = [];
    inputDriverHash = {};
    outputDriverHash = {};
    outputHash = {};
    inputHash = {};

    searchForNodes(function(){
        registerWithNodes(function(){
            async.parallel([
                updateInputs,
                updateOutputs,
                updateDrivers
            ], function(){
                if(callback){ callback(); }
            })
        });
    });
}

updateAll();

exports.updateNodes = function(req, res){
    updateAll(function(){
        res.send('Update Complete!');
    });
};

exports.updateNode = function(req, res){
    let node = req.node;

    if(!node){
        return res.status(400).send('Error attempting to update node!');
    }

    async.parallel([
        function(done){
            updateNodeDrivers(node, done);
        },
        function(done){
            updateNodeOutputs(node, done);
        },
        function(done){
            updateNodeInputs(node, done);
        }
    ], function(){
        log.info('Node added back to system!', node);
        res.send('Node Updated!');
    })
};

exports.list = function(req, res){
    res.json(nodes);
};

exports.get = function (req, res){
    res.json(req.node);
};

exports.update = function (req, res){
    let node = req.body.node,
        selNode = req.node,
        newNode = {};

    if(node.name) newNode.name = node.name;
    if(node.location) newNode.location = node.location;
    if(node.description) newNode.description = node.description;

    let info = {
        url: 'http://' + selNode.ip + '/api/server',
        form: { node: newNode }
    };

    request.put(info, function (err, reqs, body){
        if(err) return res.status(400).send('Error attempting to update node server config');
        let newOutput;

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
    req.node = nodeHash[id];
    if(req.node){ return next(); }

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
