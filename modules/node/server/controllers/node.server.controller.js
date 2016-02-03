'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
    //mongoose = require('mongoose'),
    //User = mongoose.model('User'),
	async = require('async'),
	request = require('request'),
	_ = require('lodash'),
    testAddresses = [],
    addresses = [''];

for(var i = 2; i <= 256; i++){
    testAddresses.push('10.0.0.' + i + ':2000');
}

async.each(testAddresses, function(addresss, next){
    request.get('http://' + addresss + '/api/status', function(err, res, body){
        if(!err){
            addresses.push(addresss);
        }

        next();
    });
}, function(){
    console.log('Found servers');
});

/**
 * List of Users
 */
exports.list = function (req, res){
    var nodes = [];

    async.forEach(addresses, function(address, next){
        request.get('http://' + address + '/api/status', function(err, res, body){
            if(!err) {
                try {
                    var newNodes = JSON.parse(body);
                }catch(err){
                    return next();
                }

                if (newNodes) {
                    for (var i = 0; i < newNodes.length; i++) {
                        newNodes[i].url = address;
                        nodes.push(newNodes[i]);
                    }
                }
            }

            next();
        });
    },function(){
        res.json(nodes);
    });
};

exports.set = function (req, res){
    var node = req.body.node,
		val = req.body.val;

	var info = {
		url: 'http://' + node.url + '/api/set',
		form: { pin: node.pin }
	};

	if(_.isNumber(val) || _.isBoolean(val)){
		info.form.val = +val;
	}

    request.post(info, function(err, resp, body){
		var newNode = JSON.parse(body);
		newNode.url = node.url;
		
		res.json(newNode)
	});
};
