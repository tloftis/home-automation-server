'use strict';

/**
 * Module dependencies.
 */

//Only can find address in a subnet mask of 255.255.255.0
var path = require('path'),
	async = require('async'),
	request = require('request'),
	_ = require('lodash'),
    testAddresses = [],
    addresses = [],
    os = require('os');

var netMask, localIp;
var interfaces = os.networkInterfaces();

for (var j in interfaces) {
    for (var i in interfaces[j]) {
        var address = interfaces[j][i];

        if (address.family === 'IPv4' && !address.internal) {
            netMask = address.netmask;
            localIp = address.address;
        }
    }
}

var end = 0; //because this is the best option
var ipIntro = '10.0.0.'; //becasue my default network

if(netMask){
    end = +netMask.split('.').pop();
}

if(localIp){
    var ipArr = localIp.split('.');
    ipArr.pop();
    ipIntro = ipArr.join('.') + '.';
}

for(var i = end; i <= 255; i++){
    testAddresses.push(ipIntro + i + ':' + (process.env.RELAY_PORT || 2000));
}

async.each(testAddresses, function(addresss, next){
    request.get('http://' + addresss + '/api/status', function(err, res, body){
        if(!err){
            addresses.push(addresss);
        }

        next();
    });
}, function(){
    console.log('Found ' + addresses.length + ' Servers');
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
