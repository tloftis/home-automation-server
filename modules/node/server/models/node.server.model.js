'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// NodeAPI Schema
var NodeConfigSchema = new Schema({
  config: { },
  token: {
    type: String,
    unique: true,
    trim: false,
    required: true
  },
  enabled: {
    type: Boolean,
    required: false,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

function removePrepNodeConfigRecurse(node, current) {
  if(node === current){
    return undefined;
  }

  if(current instanceof Array) {
    let newConfig = [];

    Object.keys(current).forEach((key)=>{
      key = +key; //It comes as a string, cast it back
      newConfig[key] = removePrepNodeConfigRecurse(node, current[key])

      if(newConfig[key] === undefined) {
        delete newConfig[key];
      }
    });

    return newConfig;
  } else if (typeof current === 'object') {
    let newConfig = {};

    Object.keys(current).forEach((key)=>{
      newConfig[key] = removePrepNodeConfigRecurse(node, current[key])

      if(newConfig[key] === undefined) {
        delete newConfig[key];
      }
    });

    return newConfig;
  }

  return current;
}

function removePrepNodeConfig(node){
    let newConfig = {};

    Object.keys(node).forEach((key)=>{
      newConfig[key] = removePrepNodeConfigRecurse(node, node[key]);

      if(newConfig[key] === undefined) {
        delete newConfig[key];
      }
    });

    return newConfig;
}

//Remove circular refs
NodeConfigSchema.pre('save', function (next) {
  var now = new Date();

  this.config = removePrepNodeConfig(this.config);

  if (!this.created) {
    this.created = now;
  }

  next();
});

// I use these hooks so that I don't have to do a database call in order verify a token
// The input events are far from real time, but I would like them to be a fast as piratically able without being too hacky
NodeConfigSchema.post('save', function () {
  let nodeComm = rootRequire('./modules/node/server/lib/node-communication.js');
  nodeComm.nodeConfigs[this.token] = this;
});

NodeConfigSchema.post('remove', function () {
  let nodeComm = rootRequire('./modules/node/server/lib/node-communication.js');
  delete nodeComm.nodeConfigs[this.token];
});

mongoose.model('NodeConfig', NodeConfigSchema);
