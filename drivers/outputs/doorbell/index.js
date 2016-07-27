'use strict';


var wavPath = (__dirname + '\\doorbell.wav').split('\\').join('\\\\');
var mplayerPath = (__dirname + '\\mplayer').split('\\').join('\\\\');
process.env.PATH += ';' + mplayerPath;

var master = require('../../../config.js'),
	MPlayer = require('mplayer'),
	play = new MPlayer();

var dingdong = function(){ };

play.on('ready', function(){
	dingdong = function(){
		play.openFile(wavPath);
		play.play();
	};
});

var setup = function(config) {
    var _this = this;
    _this.config = config;
};

setup.prototype.set = function(val){
	dingdong();
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
