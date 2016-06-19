'use strict';

var master = require('../../../config.js'),
    robo = require('robotjs');

var setup = function(config, listener) {
    var _this = this;
    _this.config = config;
};

setup.prototype.set = function(val){
    try{
        robo.typeString(val);
    }catch(err){
        //ToDo: add ability for some form of error handling for drivers
    }
};

setup.prototype.updateConfig = function(config){
    var _this = this;
    return _this.config;
};

setup.prototype.destroy = function(){
    var _this = this;
};

setup.prototype.getConfig = function(){
    var _this = this;
    return _this.config;
};

exports.setup = setup;
