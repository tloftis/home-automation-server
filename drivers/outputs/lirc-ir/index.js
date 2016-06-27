'use strict';

var master = require('../../../config.js'),
    fs = require('fs');

var lirc = require('lirc_node');

lirc.init();

var setup = function(config) {
    var _this = this, vars, pin;
    _this.config = {};
    _this.config.remote = config.remote;

    try{
        vars = fs.readFileSync('/etc/modules', 'utf8').split(new RegExp('[ \n]', 'g')).filter((e)=>~e.indexOf('='));
    }catch(err){
        return new Error('LIRC /etc/modules file missing, unable to use this driver');
    }

    if(!vars.some(function(e){
        if(e.indexOf('gpio_out_pin') !== -1){
            pin = +e.split('=').filter((e)=>+e)[0];
            return true;
        }
    })){
        return new Error('Unable to parse the LIRC /etc/modules file, unable to use this driver');
    }

    if(isNaN(pin)){
        return new Error('Error parsing LIRC /etc/modules file, unable to start driver');
    }
};

setup.prototype.set = function(val){
    var _this = this;
    lirc.irsend.send_once(_this.config.remote, val);
    return _this.config;
};

setup.prototype.updateConfig = function(config){
    var _this = this;

    if(config.remote){
        _this.config.remote = config.remote;
    }

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
