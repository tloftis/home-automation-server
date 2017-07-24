'use strict';

// Only can find address in a subnet mask of 255.255.255.0
let _ = require('lodash'),
    async = require('async'),
    request = rootRequire('./config/config.js').request,
    got = require('got'),
    os = require('os'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    NodeConfig = mongoose.model('NodeConfig'),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js'),
    nodePort = (process.env.RELAY_PORT || 2000);

//So this is may be very bad practice, but to avoid latency and due to the way it use to function, all of the info
// about previous nodes is stored in memory and is always updated
// the nodes should be considered references and not mutable objects, as if the reference is changed all of the code will
// freak out and weird things will happen
let comms = {
    nodeConfigs: {},
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

//This really should be a built in function for objects
function objForEach(obj, funct){
    Object.keys(obj).forEach((key)=>funct(obj[key]));
}

//Built this so that someday I may remove async, originally done during a painful debugging due to server timeout
// being stuck at 120 seconds on windows due to windows being a bitch.
function asyncParallel (array, funct, callback) {
    async.parallel((array || []).map((val)=>(next)=>{
        funct(val, next);
    }), callback);
}

//Generates a 40 byte random stirng used to make unique id's for things and making tokens
function genToken() {
    return crypto.randomBytes(40).toString('hex');
}

//This is a badly made function that trys to form all possible ip address for each interface the server has
// It doesn't take many edge cases into account and really needs to be hardened and better tested
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

                let end = 0, // because this is the best option
                    ipIntro = intro || '192.168.1.'; // because it's very common

                if (netMask) {
                    end = +netMask.split('.').pop();
                }

                if (!ipIntro && localIp) {
                    let ipArr = localIp.split('.');
                    ipArr.pop();
                    ipIntro = ipArr.join('.') + '.';
                }

                if (ipIntro[(ipIntro.length -1)] !== '.'){
                    ipIntro += '.';
                }

                for (let i = end; i <= 255; i++) {
                    testAddresses.push(ipIntro + i + ':' + nodePort);
                }
            }
        });
    });

    return testAddresses;
};

// This looks at all address on the local net. If a node is found it is added to the database if not already in the database
comms.searchForNodes = function(){
    if (arguments.length === 1){
        searchForNodes(null, arguments[0]);
    } else if (arguments.length === 2){
        searchForNodes(arguments[0], arguments[1]);
    } else {
        searchForNodes();
    }
};

//This looks at all address given or looks at all possible address names the server can see and trys to request
// from those address blindly for node configurations and then sends those off to be registered
function searchForNodes (addresses, callback) {
    if (!callback) callback = ()=>{};

    if (typeof addresses === 'string'){
        addresses = [addresses];
    } else if (!addresses || !addresses instanceof Array){
        addresses = comms.getAllIps();
    }

    asyncParallel(addresses, function(address, next){
        address = address.split(':')[0] + ':' + (address.split(':')[1] || nodePort);

        let info = {
            url: 'https://' + address + '/api/server',
            timeout: 2000
        };

        request.get(info, function (err, res, body){
            if (!err && body){
                let node;

                // parse out the info gained back from the server
                try {
                    node = JSON.parse(body);
                } catch (err){
                    return next();
                }

                node.ip = address;

                comms.registerNode(node, ()=>{
                    next()
                });
            } else {
                next();
            }
        });
    }, ()=>{
        callback();
    });
}


//This will take a json object and detirmin if it is a real node config, if so it will build the proper object out of it
// And add it to the global comms.nodes and nodeHash vars and return back the newly made config
comms.registerNode = function(node, callback){
    if (!callback){
        callback = ()=>{};
    }

    if (node && node.id && node.ip){
        let newNode = {
            id: node.id,
            ip: node.ip.split(':')[0] + ':' + (node.ip.split(':')[1] || nodePort),
            name: node.name || '',
            description: node.description || '',
            location: node.location || '',
            enableWebInterface: true,
            inputDrivers: [],
            outputDrivers: [],
            active: true,
            update: ()=>{}
        };

        log.success('Registered node', newNode);

        comms.nodeHash[newNode.id] = newNode;
        comms.nodes = Object.keys(comms.nodeHash).map(k=>comms.nodeHash[k]);

        return callback(undefined, newNode);
    } else {
        log.error('Error attempting to validate new Node', node);
        callback(new Error('Error registering node!'))
    }
};

//Given a legal node config it will ask that node for all of it's inputs and add them to the node object
// and add them to the global comms.inputs and hash array
comms.updateNodeInputs = (node, callback)=>{
    if (!callback) callback = function(){};

    let info = {
        url: 'https://' + node.ip + '/api/input'
    };

    request.get(info, function(err, res, body){
        let newInputs;

        if (err){
            node.active = false;
            log.error('Failed To get Inputs of Node: ' + node.id, err);
        }

        try {
            newInputs = JSON.parse(body);
        } catch (err){
            log.error('Failed To Parse Inputs of Node: ' + node.id, body);
            return callback();
        }

        if (err){
            return callback();
        } else {
            node.active = true;

            comms.inputs = comms.inputs.filter((input)=>{
                if (input.node.id === node.id){
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
            }, function(){
                log.success('Updated all inputs of node: ' + node.id, node);
                callback();
            });
        }
    });
};

//Given a legal node config it will ask that node for all of it's outputs and add them to the node object
// and add them to the global comms.outputs and hash array
comms.updateNodeOutputs = (node, callback)=>{
    if (!callback) callback = function(){};

    let info = {
        url: 'https://' + node.ip + '/api/output'
    };

    request.get(info, function(err, res, body){
        let newOutputs;

        if (err){
            log.error('Error getting outputs for node: ' + node.id, err);
            node.active = false;
            return callback();
        }

        try {
            newOutputs = JSON.parse(body);
        } catch (err){
            log.error('Error Parsing Node Outputs: ' + node.id, body);
            return callback();
        }

        node.active = true;

        comms.outputs = comms.outputs.filter((output)=>{
            if (output.node.id === node.id){
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
        }, function(){
            log.success('Updated outputs for node!', node);
            callback();
        });
    });
};

//Given a legal node config it will ask that node for all of it's drives and add them to the node object
// and add them to the global comms.outputDrivers and comms.inputDrivers and hashs
comms.updateNodeDrivers = (node, callback)=>{
    if (!callback) callback = function(){};

    async.parallel([function(nextMid){
        let info = {
            url: 'https://' + node.ip + '/api/output/drivers'
        };

        request.get(info, function(err, res, body){
            let newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return nextMid();
            }

            if (err){
                node.active = false;
                return nextMid();
            } else {
                node.active = true;

                node.outputDrivers = (node.outputDrivers || []).filter((outputDriver)=>{
                    if (node.outputDrivers.indexOf(outputDriver) !== -1){
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
                        id: driver.id
                    };

                    node.outputDrivers.push(newDriver);
                    node.active = true;
                    comms.outputDriverHash[newDriver.id] = newDriver;
                    next();
                }, function(){
                    nextMid();
                });
            }
        });
    }, function(nextMid){
        let info = {
            url: 'https://' + node.ip + '/api/input/drivers'
        };

        request.get(info, function(err, res, body){
            let newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return nextMid();
            }

            if (err){
                node.active = false;
                return nextMid();
            } else {
                node.active = true;

                node.inputDrivers = (node.inputDrivers || []).filter((inputDriver)=>{
                    if (node.inputDrivers.indexOf(inputDriver) !== -1){
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
                        id: driver.id
                    };

                    node.inputDrivers.push(newDriver);
                    comms.inputDriverHash[newDriver.id] = newDriver;
                    next();
                }, function(){
                    nextMid();
                });
            }
        });
    }], function(){
        callback();
    });
};

//This gives the token to the node so that the node can talk to the server, but only if the enable flag
// is set to true in the database, only called via the updateNode function, possibly should be added to the register
// function since it would make sense conceptually
comms.updateNodeServer = (node, token, callback)=>{
    if (!callback) callback = function(){};

    let info = {
        url: 'https://' + node.ip + '/api/server',
        form: {
            port: process.env.PORT,
            token: token
        }
    };

    request.post(info, function(err, res, body){
        if (err){
            log.error('Error registering server: ' + node.id, err);
            node.active = false;
            return callback(err);
        }

        if (res.statusCode !== 200){
            log.error('Error registering server: ' + node.id, body);
            node.active = false;
            return callback(body);
        }

        log.success('Registered server to node!', node);
        callback(undefined, node);
    });
};

//This function takes a node config reference and will populate all of it's inputs, outputs and drivers directly
// from the hardware as well as setup it's update function so that it can be updated on the fly.
comms.updateNode = (node, callback)=>{
    async.parallel([
        (next)=>comms.updateNodeInputs(node, next),
        (next)=>comms.updateNodeOutputs(node, next),
        (next)=>comms.updateNodeDrivers(node, next)
    ], ()=>{
        NodeConfig.findOne({ 'config.id': node.id }, (err, nodeData)=>{
            if (err) {
                log.error('Error attempting to find Node Config in database', node);
                return callback(new Error('Error registering node!'));
            }

            if (!nodeData) {
                nodeData = new NodeConfig({ config: node, enabled: false, token: genToken() });
            }

            let newRef = node;
            newRef.update = (callback)=>{
                nodeData.config = newRef;

                nodeData.save((err, nodeConfig)=>{
                    if (err) {
                        log.error('Failed update Node Config', err);
                        return callback(err);
                    }

                    log.info('Node Config Updated!', newRef);

                    if (callback){
                        callback(null, nodeConfig)
                    }
                });
            };

            newRef.enable = ()=>{
              nodeData.enabled = true;
              newRef.update();
            };

            newRef.disable = ()=>{
                nodeData.enabled = false;
                newRef.update();
            };

            newRef.update((err, conf)=>{
                comms.updateNodeServer(newRef, conf.token, callback);
            });
        });
    });
};

//Goes though all node configs currently in memory and updates all of their updates inputs, outputs, drivers
// and also empties memory of all previously known inputs and outputs so that no non-functional ones exist
// But that may soon be removed and have inputs, outputs, and drivers also have a store in the data base so that enven
// if they no longer exist they can still be seen and if they currently aren't online they can still be referenced
comms.updateAll = (callback)=>{
    comms.outputs = [];
    comms.inputs = [];
    comms.inputDriverHash = {};
    comms.outputDriverHash = {};
    comms.outputHash = {};
    comms.inputHash = {};

    comms.nodes = Object.keys(comms.nodeHash).map(k=>comms.nodeHash[k]);

    async.forEach(comms.nodes, (node, next)=>{
        comms.updateNode(node, (err, node)=>{
            if (!node.active){
                log.error('Failed to to connect to node: ' + node.ip, node);
            }

            next()
        });
    }, ()=>{
        callback();
    });
};

// Used to register new node input and output, adds to array and gives them new ids
comms.registerInput = function(config){
    comms.inputs.push(config);
    comms.inputHash[config.id] = config;
};

comms.registerOutput = function(config){
    comms.outputs.push(config);
    comms.outputHash[config.id] = config;
};

// FIXME: pretty sure this is broken, but I am not using it yet so ehh, lint
comms.registerInit = (data)=>{
    let allowed = data.some((reg)=>{
        return reg.token === data.token;
    });

    if (allowed) {
        return;
    }

    allowed.push(data);

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

//Veriys that node is using an existing token and that that node is enabled
comms.verifyToken = (req, res, next)=>{
    let token = req.headers['x-token'],
        node = comms.nodeConfigs[token],
        ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();

    if (node && node.enabled) {
        req.nodeConfig = node;
        return next();
    }

    log.error('Node Token Validation Attempt Failed: ' + token, ip);

    return res.status(400).send({
        message: 'Token Invalid'
    });
};

comms.deRegister = (token)=>{
    comms.registered = comms.registered.filter((data)=>{
        return data.token === token
    });
};

NodeConfig.find({}).lean().exec((err, nodeConfigs)=>{
    if (err) {
        log.error('populate nodeConfigs', err);
        return;
    }

    comms.nodeConfigs = (nodeConfigs || []).reduce((cur, con)=>{
        cur[con.token] = con;
        comms.nodes.push(con.config);
        comms.nodeHash[con.config.id] = con.config;
        con.config.active = false;
        return cur;
    }, {});

    comms.searchForNodes(()=>{
        console.log('Searched');

        comms.updateAll(()=>{
            console.log('All Nodes Updated Successfully!');
        })
    });
});

module.exports = comms;
