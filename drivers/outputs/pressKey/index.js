'use strict';

var master = require('../../../config.js'),
    robo = require('robotjs');

var setup = function(config) {
    var _this = this;
    _this.config = config;
};

setup.prototype.set = function(val){
    try{
        robo.keyTap(val);
    }catch(err){
        if(val === 'right_click'){
            robo.mouseClick('right');
        }else if(val === 'left_click'){
            robo.mouseClick('left');
        }else if(val === 'middle_click'){
            robo.mouseClick('middle');
        }
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
