'use strict';

// Only can find address in a subnet mask of 255.255.255.0
let _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  got = require('got'),
  os = require('os'),
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  NodeServerToken = mongoose.model('NodeServerToken'),
  NodeToken = mongoose.model('NodeToken'),
  log = rootRequire('./modules/core/server/controllers/log.server.controller.js'),
  nodePort = (process.env.RELAY_PORT || 2000);

let comms = {
  tokens: [],
  registered: [],
  outputs: [],
  inputs: [],
  nodes: [],
  nodeHash: {},
  inputDriverHash: {},
  outputDriverHash: {},
  outputHash: {},
  inputHash: {},
  serverToken: ''
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

        let end = 0, // because this is the best option
          ipIntro = intro || '192.168.1.'; // because it's my default network

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

function searchForNodes (addresses, callback) {
  if (!callback) callback = ()=>{};

  if (typeof addresses === 'string'){
    addresses = [addresses];
  } else if (!addresses || !addresses instanceof Array){
    addresses = comms.getAllIps();
  }

  asyncParallel(addresses, function(address, next){
    let info = {
      headers: {
        'X-Token': comms.serverToken
      },
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
    comms.nodes = Object.keys(comms.nodeHash).map(k=>comms.nodeHash[k]);

    comms.nodes.forEach(n=>{
      if (!n.active){
        log.error('Failed to to connect to node: ' + n.ip, n);
      }
    });

    callback();
  });
}

comms.registerNode = function(node, callback){
  if (!callback){
    callback = ()=>{};
  }

  console.log(node);

  if (node && node.id && node.token && node.ip){
    let newNode = {
      id: node.id,
      ip: node.ip.split(':')[0] + ':' + (node.ip.split(':')[1] || nodePort),
      name: node.name || '',
      description: node.description || '',
      location: node.location || '',
      token: node.token,
      inputDrivers: [],
      outputDrivers: [],
      active: true
    };

    comms.nodeHash[newNode.id] = newNode;
    comms.nodes = Object.keys(comms.nodeHash).map(k=>comms.nodeHash[k]);

    comms.updateNode(newNode, ()=>{
      log.success('Registered new node', newNode);
      callback(undefined, newNode);
    });
  } else {
    log.error('Error attempting to validate new Node', node);
    callback(new Error('Error registering node!'))
  }
};

comms.updateNodeInputs = (node, callback)=>{
  if (!callback) callback = function(){};

  let info = {
    headers: {
      'X-Token': comms.serverToken
    },
    url: 'https://' + node.ip + '/api/input',
    rejectUnhauthorized: false
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

comms.updateInputs = (callback)=>{
  if (!callback) callback = function(){};

  async.each(comms.nodes, function (node, nextMain){
    comms.updateNodeInputs(node, nextMain);
  }, callback);
};

comms.updateNodeOutputs = (node, callback)=>{
  if (!callback) callback = function(){};

  let info = {
    headers: {
      'X-Token': comms.serverToken
    },
    url: 'https://' + node.ip + '/api/output',
    rejectUnhauthorized: false
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

comms.updateOutputs = (callback)=>{
  if (!callback) callback = function(){};

  async.each(comms.nodes, function (node, nextMain){
    comms.updateNodeOutputs(node, nextMain);
  }, callback);
};

comms.updateNodeDrivers = (node, callback)=>{
  if (!callback) callback = function(){};

  async.parallel([function(nextMid){
    let info = {
      headers: {
        'X-Token': comms.serverToken
      },
      url: 'https://' + node.ip + '/api/output/drivers',
      rejectUnhauthorized: false
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
      headers: {
        'X-Token': comms.serverToken
      },
      url: 'https://' + node.ip + '/api/input/drivers',
      rejectUnhauthorized: false
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

comms.updateDrivers = (callback)=>{
  if (!callback) callback = function(){};

  async.each(comms.nodes, function(node, nextMain){
    comms.updateNodeDrivers(node, nextMain);
  }, callback);
};

comms.updateNodeServer = (node, callback)=>{
  if (!callback) callback = function(){};

  let info = {
    headers: {
      'X-Token': comms.serverToken
    },
    url: 'https://' + node.ip + '/api/register',
    rejectUnhauthorized: false,
    form: {
      port: process.env.PORT
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
    callback();
  });
};

comms.updateNode = (node, callback)=>{
  console.log('Updating', node);

  async.parallel([
    (next)=>comms.updateNodeServer(node, next),
    (next)=>comms.updateNodeInputs(node, next),
    (next)=>comms.updateNodeOutputs(node, next),
    (next)=>comms.updateNodeDrivers(node, next)
  ], ()=>{
    if (callback){ callback(); }
  })
};

comms.updateAll = (callback)=>{
  comms.outputs = [];
  comms.inputs = [];
  comms.inputDriverHash = {};
  comms.outputDriverHash = {};
  comms.outputHash = {};
  comms.inputHash = {};

  comms.searchForNodes(function(){
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

comms.registerInit = (data)=>{
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

comms.verifyToken = function(req, res, next){
  let token = req.headers['x-token'];
  let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();

  if (comms.tokens.some((token)=>(token.token !== token && token.enabled))){
    log.error('Node Token Validation Attempt Failed: ' + token, ip);

    return res.status(400).send({
      message: 'Token Invalid'
    });
  }

  next();
};

comms.deRegister = (token)=>{
  comms.registered = comms.registered.filter((data)=>{
    return data.token === token
  });
};

function asyncParallel (array, funct, callback) {
  async.parallel((array || []).map((val)=>(next)=>{
    funct(val, next);
  }), callback);
}

NodeServerToken.find({}).sort({ created: -1 }).lean().exec(function(err, tokens){
  if (!tokens.length){
    let token = new NodeServerToken({ token: crypto.randomBytes(40).toString('hex') });

    comms.serverToken = token;

    return token.save(function(err, newLog){
      log.error('Error attempting to save Server Token: ' + token, err);
      throw err;
    });
  } else {
    comms.serverToken = tokens[0].token;
  }

  console.log('Server Token:', comms.serverToken);
  comms.updateAll(()=>{ console.log('Node Broadcast Complete! If nodes configured to this server exists, they will begin to propagate')});
    // comms.searchForNodes('192.168.1.131:2000', ()=>{ console.log('Node Broadcast Complete! If nodes configured to this server exists, they will begin to propagate')});
});

NodeToken.find({}).lean().exec((err, tokens)=>{
  comms.tokens = tokens;
});

module.exports = comms;
