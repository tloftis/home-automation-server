'use strict';

var master = require('../../../config.js');

function set(pin, newVal){
    master.gpio.digitalWrite(+pin.pin, +newVal);
}

function isNumber(val){
    return typeof val === 'number';
}

function isBoolean(val){
    return typeof val === 'boolean';
}

exports.config = {
    pin: {
        name: 'Pin',
        required: true,
        pin: true
    },
    val: {
        name: 'Current Value',
        type: master.types.boolean,
        required: false
    }
};

var setup = function(config) {
    var _this = this;

    if(!config || !+config.pin || isNaN(+config.pin)){ //There is no 0 pin, so this should always fail be because of an error
        return new Error('No Pin Specified!');
    }

    config.pin = +config.pin;

    if(!master.registerPin(config.pin)){
        return new Error('Unable to register on specified pin');
    }

    master.gpio.pinMode(config.pin, master.gpio.OUTPUT);
    _this.config = {};
    _this.config.pin = config.pin;
    _this.config.val = config.val ? true : false;
    set(_this.config, _this.config.val ? 1 : 0);
    _this.set(config.val); //Sets the this.config.val
};

setup.prototype.set = function(val){
    this.config.val = this.config.val ? false : true;
    set(this.config, this.config.val ? 1 : 0);
    return this.config;
};

setup.prototype.updateConfig = function(config){
    var _this = this;

    if(config.pin && !isNaN(+config.pin) && (+config.pin !== _this.config.pin)){ //There is no 0 pin, so this should always fail be because of an error
        config.pin = +config.pin;

        if(master.registerPin(config.pin)){
            master.unRegisterPin(_this.config.pin);
            _this.config.pin = config.pin;
            _this.set(_this.config.val);
        }
    }

    if(isNumber(config.val) || isBoolean(config.val)){
        _this.set(config.val);
    }

    return _this.config;
};

setup.prototype.destroy = function(){
    var _this = this;
    master.unRegisterPin(_this.config.pin);
};

setup.prototype.getConfig = function(){
    var _this = this;
    return _this.config;
};

exports.setup = setup;