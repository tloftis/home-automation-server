'use strict';

//Only can find address in a subnet mask of 255.255.255.0
var _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    fs = require('fs'),
    os = require('os'),
    crypto = require('crypto'),
    testAddresses = [];

var nodes = [],
    outputs = [],
    inputs = [],
    inputDriverHash = {},
    outputDriverHash = {},
    nodeHash = {},
    outputHash = {},
    inputHash = {};

var netMask, localIp;
var interfaces = os.networkInterfaces();

for (var j in interfaces){
    for (var i in interfaces[j]){
        var address = (interfaces[j] || {})[i] || {};

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

//Gets the absolute location of the folder contained by a require file selector
function rationalizePaths(array){
    var path;

    for(var i = 0, len = array.length; i < len; i++){
        //I know, this is very unneeded, but I like having it because of it's over bearing round-a-bout-ness
        path = require.resolve(array[i]);
        array[i] = { index: path, config: path.replace(/index\.js/, 'config.json') };
    }

    return array;
}

function genId(){
    return crypto.randomBytes(25).toString('hex');
}

function writeConfig(fileLoc, obj, callback){
    if(!callback) callback = function(){};
    var objStr = JSON.stringify(obj, null, 4);

    fs.writeFile(fileLoc, objStr, function(err) {
        callback(err);
    });
}

var glob = require('glob'),
    pipLocations = rationalizePaths(glob.sync('../pipes/*/index.js', { cwd: __dirname })),
    pipeHash = {},
    pipes = [];

function findPipes(callback){
    var pipe,
        config;

    pipeHash = {};
    pipes = [];

    for(var i = 0; i < pipLocations.length; i++){
        pipe = require(pipLocations[i].index);
        config = require(pipLocations[i].config);

        if(!config.id){
            config.id = genId();
            writeConfig(pipLocations[i].config, config);
        }

        _.extend(pipe, config);
        pipes.push(pipe);
        pipeHash[pipe.id] = pipe;
    }

    if(callback){ callback(); }
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
                        location: node.location || '',
                        inputDrivers : [],
                        outputDrivers : []
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

function registerWithNode(node, callback){
    if(!callback) callback = function(){};

    var info = {
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
        var newInputs;

        try {
            newInputs = JSON.parse(body);
        } catch (err){
            return callback();
        }

        if(err){
            return callback();
        }else{
            inputs = inputs.filter((input)=>{
                if(input.node.id === node.id){
                    delete inputHash[input.id];
                    return false;
                }

                return true;
            });

            async.each(newInputs, function (input, next){
                var newInput = {
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
        var newOutputs;

        try {
            newOutputs = JSON.parse(body);
        } catch (err){
            return callback();
        }

        if(err){
            return callback();
        }else{
            outputs = outputs.filter((output)=>{
                if(output.node.id === node.id){
                    delete outputHash[output.id];
                    return false;
                }

                return true;
            });

            async.each(newOutputs, function (output, next){
                var newOutput = {
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
            var newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return nextMid();
            }

            if(err){
                return nextMid();
            }else{
                node.outputDrivers = (node.outputDrivers || []).filter((outputDriver)=>{
                    if(node.outputDrivers.indexOf(outputDriver) !== -1){
                        delete outputDriverHash[outputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function (driver, next){
                    var newDriver = {
                        name: driver.name,
                        location: driver.location,
                        description: driver.description,
                        type: driver.type,
                        config: driver.config,
                        id: driver.id
                    };

                    node.outputDrivers.push(newDriver);
                    outputDriverHash[newDriver.id] = newDriver;
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
                node.inputDrivers = (node.inputDrivers || []).filter((inputDriver)=>{
                    if(node.inputDrivers.indexOf(inputDriver) !== -1){
                        delete inputDriverHash[inputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function (driver, next){
                    var newDriver = {
                        name: driver.name,
                        location: driver.location,
                        description: driver.description,
                        type: driver.type,
                        config: driver.config,
                        id: driver.id
                    };

                    node.inputDrivers.push(newDriver);
                    inputDriverHash[newDriver.id] = newDriver;
                    next();
                },function(){
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
    nodes = [];
    outputs = [];
    inputs = [];
    pipes = [];
    pipeHash = {};
    inputDriverHash = {};
    outputDriverHash = {};
    nodeHash = {};
    outputHash = {};
    inputHash = {};

    findPipes(function(){
        searchForNodes(function(){
            registerWithNodes(function(){
                async.parallel([
                    updateInputs,
                    updateOutputs,
                    updateDrivers
                ], function(){
                    refreshLink();
                    if(callback){ callback(); }
                })
            });
        });
    });
}

updateAll();

function refreshLink(){
    module.exports.nodes = nodes;
    module.exports.outputs = outputs;
    module.exports.inputs = inputs;
    module.exports.pipes = pipes;
    module.exports.outputDriverHash = outputDriverHash;
    module.exports.inputDriverHash = inputDriverHash;
    module.exports.nodeHash = nodeHash;
    module.exports.inputHash = inputHash;
    module.exports.outputHash = outputHash;
    module.exports.pipeHash = pipeHash;
}

refreshLink();

exports.updateNodes = function(req, res){
    updateAll(function(){
        res.send('Pipes Updated!');
    });
};

exports.updateNode = function(req, res){
    var node = req.node;

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
        refreshLink();
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
