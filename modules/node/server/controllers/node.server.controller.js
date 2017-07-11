'use strict';

// Only can find address in a subnet mask of 255.255.255.0
var _ = require('lodash'),
  async = require('async'),
  request = require('request'),
  fs = require('fs'),
  os = require('os'),
  nodeComm = rootRequire('./modules/node/server/lib/node-communication.js'),
  log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

function stripObjProp(obj, props){
  if (typeof props === 'string'){
    props = [props];
  }

  let newObj = {};

  Object.keys(obj).forEach(k=>{
    if (props.indexOf(k) === -1){
      newObj[k] = obj[k];
    }
  });

  return newObj;
}

exports.updateNodes = function(req, res){
  nodeComm.updateAll(function(){
    res.send('Update Complete!');
  });
};

exports.updateNode = function(req, res){
  let node = req.node;

  if (!node){
    return res.status(400).send('Error attempting to update node!');
  }

  nodeComm.updateNode(node, ()=>{
    log.info('Node added back to system!', node);
    res.send('Node Updated!');
  });
};

exports.register = function(req, res, next){
  let config = req.body,
    ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();

  console.log(req.body, ip);

  if (!config.port){
    return res.status(400).jsonp({
      message: 'Error registering node!'
    });
  }

  nodeComm.searchForNodes(ip + ':' + config.port, (err)=>{
    if (!err){
      res.status(200).jsonp({
        message: 'Node Successfully Registered!'
      });
    } else {
      res.status(400).jsonp({
        message: 'Error registering node!'
      });
    }
  })
};

exports.list = function(req, res){
  res.json(nodeComm.nodes.map(n=>stripObjProp(n, 'token')));
};

exports.get = function (req, res){
  res.json(stripObjProp(req.node, 'token'));
};

exports.update = function (req, res){
  let node = req.body.node,
    selNode = req.node,
    newNode = {};

  if (node.name) newNode.name = node.name;
  if (node.location) newNode.location = node.location;
  if (node.description) newNode.description = node.description;
  if (typeof node.enableWebInterface === 'boolean') newNode.enableWebInterface = node.enableWebInterface;

  let info = {
    url: 'https://' + selNode.ip + '/api/server',
    form: { node: newNode }
  };

  request.put(info, function (err, reqs, body){
    if (err) {
      node.active = false;
      log.error('Failed to update config of node: ' + node.ip, err);
      return res.status(400).send('Error attempting to update node server config');
    }

    let newOutput;

    try {
      newOutput = JSON.parse(body);
    } catch (err){
      return res.status(400).send('Unable to get updated node server configuration');
    }

    selNode.description = newOutput.description;
    selNode.location = newOutput.location;
    selNode.name = newOutput.name;
    selNode.active = true;
    res.json(stripObjProp(selNode, 'token'));
  });
};

exports.nodeById = function (req, res, next, id){
  req.node = nodeComm.nodeHash[id];
  if (req.node){ return next(); }

  return res.status(400).send({
    message: 'Node could not be found'
  });
};
