'use strict';

//Only can find address in a subnet mask of 255.255.255.0
let _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    got = require('got'),
    os = require('os'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

let comms = {
    registered: [],
    outputs: [],
    inputs: [],
    nodes: [],
    nodeHash: {},
    inputDriverHash: {},
    outputDriverHash: {},
    outputHash: {},
    inputHash: {}
};

function objForEach(obj, funct){
    Object.keys(obj).forEach((key)=>funct(obj[key]));
}

comms.getAllIps = (intro)=>{
    let netMask, 
        localIp,
        interfaces = os.networkInterfaces(),
        testAddresses = [];

    objForEach(interfaces, (interF) => {
        interF.forEach((address) => {
            if (address.family === 'IPv4' && !address.internal) {
                netMask = address.netmask;
                localIp = address.address;

                let end = 0, //because this is the best option
                    ipIntro = intro || '192.168.1.'; //because it's my default network

                if (netMask) {
                    end = +netMask.split('.').pop();
                }

                if (!ipIntro && localIp) {
                    let ipArr = localIp.split('.');
                    ipArr.pop();
                    ipIntro = ipArr.join('.') + '.';
                }

                if(ipIntro[(ipIntro.length -1)] !== '.'){
                    ipIntro += '.';
                }

                for (let i = end; i <= 255; i++) {
                    testAddresses.push(ipIntro + i + ':' + (process.env.RELAY_PORT || 2000));
                }
            }
        });
    });
    
    return testAddresses;
};

//This looks at all address on the local net. If a node is found it is added to the database if not already in the database
comms.searchForNodes = function(){
    if(arguments.length ===1){
        searchForNodes(null, arguments[0]);
    } else if(arguments.length === 2){
        searchForNodes(arguments[0], arguments[1]);
    } else {
        searchForNodes();
    }
};

function searchForNodes (addresses, callback) {
    if(!callback) callback = ()=>{};

    if(typeof addresses === 'string'){
        addresses = [addresses];
    } else if(!addresses || !addresses instanceof Array){
        addresses = comms.getAllIps();
    }

    comms.nodes.forEach((node)=>node.active=false);

    asyncParallel([addresses[5]], function(address, next){
        let info = {
            url: 'http://' + address + '/api/server',
            timeout: 2000
        };

        request.get(info, function(err, res, body){
            if (!err && body){
                let node;

                //parse out the info gained back from the server
                try {
                    node = JSON.parse(body);
                }catch(err){
                    return next();
                }

                if(node && (node.id !== '')){
                    comms.nodeHash[node.id] = {
                        id: node.id,
                        ip: address,
                        name: node.name || '',
                        description: node.description || '',
                        location: node.location || '',
                        inputDrivers : [],
                        outputDrivers : [],
                        active: true
                    };
                }
            }

            next();
        });
    },()=>{
        comms.nodes = Object.keys(comms.nodeHash).map(k=>comms.nodeHash[k]);
        console.log(comms.nodes);

        comms.nodes.forEach(n=>{
            if(!node.active){
                log.error('Failed to to connect to node: ' + n.ip, n);
            }
        });

        callback();
    });
}

comms.registerWithNode = (node, callback)=>{
    if(!callback) callback = function(){};

    let info = {
        url: 'http://' + node.ip + '/api/register',
        form: {}
    };

    request.post(info, ()=>{
        callback();
    });
};

comms.registerWithNodes = (callback)=>{
    if(!callback) callback = function(){};

    async.each(comms.nodes, (node, next)=>{
        comms.registerWithNode(node, next);
    }, callback);
};

comms.updateNodeInputs = (node, callback)=>{
    if(!callback) callback = function(){};

    request.get('http://' + node.ip + '/api/input', function(err, res, body){
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

            comms.inputs = comms.inputs.filter((input)=>{
                if(input.node.id === node.id){
                    delete comms.inputHash[input.id];
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

                comms.inputs.push(newInput);
                comms.inputHash[newInput.id] = newInput;
                next();
            },function(){
                callback();
            });
        }
    });
};

comms.updateInputs = (callback)=>{
    if(!callback) callback = function(){};

    async.each(comms.nodes, function (node, nextMain){
        comms.updateNodeInputs(node, nextMain);
    }, callback);
};

comms.updateNodeOutputs = (node, callback)=>{
    if(!callback) callback = function(){};

    request.get('http://' + node.ip + '/api/output', function(err, res, body){
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

            comms.outputs = comms.outputs.filter((output)=>{
                if(output.node.id === node.id){
                    delete comms.outputHash[output.id];
                    return false;
                }

                return true;
            });

            async.each(newOutputs, function(output, next){
                let newOutput = {
                    name: output.name,
                    location: output.location,
                    description: output.description,
                    driverId: output.driverId,
                    config: output.config,
                    id: output.id,
                    node: node
                };

                comms.outputs.push(newOutput);
                comms.outputHash[newOutput.id] = newOutput;
                next();
            },function(){
                callback();
            });
        }
    });
};

comms.updateOutputs = (callback)=>{
    if(!callback) callback = function(){};

    async.each(comms.nodes, function (node, nextMain){
        comms.updateNodeOutputs(node, nextMain);
    }, callback);
};

comms.updateNodeDrivers = (node, callback)=>{
    if(!callback) callback = function(){};

    async.parallel([function(nextMid){
        request.get('http://' + node.ip + '/api/output/drivers', function(err, res, body){
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
                        delete comms.outputDriverHash[outputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function(driver, next){
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
                    comms.outputDriverHash[newDriver.id] = newDriver;
                    next();
                },function(){
                    nextMid();
                });
            }
        });
    }, function(nextMid){
        request.get('http://' + node.ip + '/api/input/drivers', function(err, res, body){
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
                        delete comms.inputDriverHash[inputDriver.id];
                        return false;
                    }

                    return true;
                });

                async.each(newDrivers, function(driver, next){
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
                    comms.inputDriverHash[newDriver.id] = newDriver;
                    next();
                },function(){
                    nextMid();
                });
            }
        });
    }], function(){
        callback();
    });
};

comms.updateDrivers = (callback)=>{
    if(!callback) callback = function(){};

    async.each(comms.nodes, function(node, nextMain){
        comms.updateNodeDrivers(node, nextMain);
    }, callback);
};

comms.updateAll = (callback)=>{
    comms.outputs = [];
    comms.inputs = [];
    comms.inputDriverHash = {};
    comms.outputDriverHash = {};
    comms.outputHash = {};
    comms.inputHash = {};

    comms.searchForNodes(function(){
        comms.registerWithNodes(function(){
            async.parallel([
                comms.updateInputs,
                comms.updateOutputs,
                comms.updateDrivers
            ], function(){
                if(callback){ callback(); }
            })
        });
    });
};

//Used to register new node input and output, adds to array and gives them new ids
exports.registerInput = function(config){
    inputs.push(config);
    comms.inputHash[config.id] = config;
};

exports.registerOutput = function(config){
    outputs.push(config);
    comms.outputHash[config.id] = config;
};

exports.registerInit = (data)=>{
    let registered = registered.some((reg)=>{
        return reg.token === data.token;
    });

    if (registered) {
        return;
    }

    registered.push(data);

    let inputs = comms.inputs.filter((input)=>{
            return data.permissions.indexOf(input.id) !== -1;
        }),
        outputs = comms.outputs.filter((output)=>{
            return data.permissions.indexOf(output.id) !== -1;
        });

    inputs = inputs.map((input)=>{
        return {
            id: input.id,
            name: input.name,
            description: input.description,
            location: input.location,
            active: input.active
        }
    });

    outputs = outputs.map((output)=>{
        return {
            id: output.id,
            name: output.name,
            description: output.description,
            location: output.location,
            active: output.active
        }
    });

    return {
        inputs: inputs,
        outputs: outputs
    }
};

exports.deRegister = (token)=>{
    comms.registered = comms.registered.filter((data)=>{
        return data.token === token
    });
};

function asyncParallel (array, funct, callback) {
    async.parallel((array || []).map((val)=>(next)=>{
        funct(val, next);
    }), callback);
}

comms.updateAll(()=>{ console.log('found nodes')});
module.exports = comms;
