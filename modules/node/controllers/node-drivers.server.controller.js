'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),
    zlib = require('zlib'),
    tar = require('tar'),
    fstream = require('fstream'),
    fs = require('fs'),
    glob = require('glob'),
    driverId = 0,
    outputDriverLocs = [],
    inputDriverLocs = [],
    outputDriverLocHash = {},
    inputDriverLocHash = {},
    masterNode = require('./node.server.controller').
    log = rootRequire('./modules/core/controllers/log.server.controller.js');

//Gets the absolute location of the folder contained by a require file selector
function rationalizePaths(array){
    var path, config;

    for(var i = 0, len = array.length; i < len; i++){
        path = rootRequire.resolve(array[i]);

        array[i] = {
            dir: path.replace(/index\.js/, ''),
            config: (rootRequire(path.replace(/index\.js/, 'config.json')) || {}),
            id: ++driverId
        };
    }

    return array;
}

function updateDriverLocations(){
    driverId = 0;

    outputDriverLocs = rationalizePaths(glob.sync('./drivers/outputs/*/index.js', { cwd: rootDir }));
    inputDriverLocs = rationalizePaths(glob.sync('./drivers/inputs/*/index.js', { cwd: rootDir }));
    outputDriverLocHash = {};
    inputDriverLocHash = {};

    outputDriverLocs.forEach(function(val){ outputDriverLocHash[val.id] = val; });
    inputDriverLocs.forEach(function(val){ inputDriverLocHash[val.id] = val; });
}
updateDriverLocations();

exports.list = function(req, res){
    res.send({
        outputDriver: outputDriverLocs,
        inputDriver: inputDriverLocs
    });
};

exports.update = function (req, res){
    updateDriverLocations();

    return res.send({
        message: 'Driver List updated!'
    });
};

exports.add = function (req, res){
    var node = req.node,
        driverId = (req.body || {}).driverId,
        driver, url;

    if(!driverId){
        return res.status(400).send({
            message: 'Driver can not be found, ID not provided'
        });
    }

    if(driver = inputDriverLocHash[driverId]){
        url = 'http://' + node.ip + '/api/input/drivers'
    }else if(driver = outputDriverLocHash[driverId]){
        url = 'http://' + node.ip + '/api/output/drivers'
    }else{
        return res.status(400).send({
            message: 'Driver can not be found, ID not linked to existing driver'
        });
    }

    var called = false;
    function onError(err) {
        if(!called){
            res.status(400).send({
                message: (err || {}).message || 'An unknown error has occurred'
            });
        }

        called = true;
    }

    var packer = tar.Pack({ noProprietary: true })
        .on('error', onError);

    fstream
        .Reader({ path: driver.dir, type: 'Directory' })
        .on('error', onError)

        .pipe(packer)
        .on('error', onError)

        .pipe(zlib.createGzip())
        .on('error', onError)
        .pipe(request.post(url, function (err, resq, body){
            var newDrivers;

            try {
                newDrivers = JSON.parse(body);
            } catch (err){
                return res.status(400).send({
                    message: 'Failure to upload driver!'
                });
            }

            if(newDrivers.message){
                return res.status(400).send({
                    message: newDrivers.message
                });
            }

            if(inputDriverLocHash[driverId]){
                node.inputDrivers = newDrivers;

                newDrivers.forEach(function(driver){
                    masterNode.inputDriverHash[driver.id] = driver;
                });
            }else{
                node.outputDrivers = newDrivers;

                newDrivers.forEach(function(driver){
                    masterNode.outputDriverHash[driver.id] = driver;
                });
            }

            return res.send(node);
        }))
        .on('error', onError);
};

exports.removeDriver = function (req, res){
    var driver = req.driver;
    var node, isInput = false;

    if(!masterNode.nodes.some(function(curNode){
        if(curNode.inputDrivers.indexOf(driver) !== -1){
            node = curNode;
            isInput = true;
            return true;
        }

        if(curNode.outputDrivers.indexOf(driver) !== -1){
            node = curNode;
            return true;
        }
    })){
        return res.status(400).send('Node to remove driver from was not found');
    }

    request.del('http://' + node.ip + '/api/drivers/' + driver.id, function (err, resq, body) {
        if (err){ return res.status(400).send('Error attempting to add input'); }

        if(isInput){
            node.inputDrivers.splice(node.inputDrivers.indexOf(driver), 1);
            delete masterNode.inputDriverHash[driver.id];
        }else{
            node.outputDrivers.splice(node.outputDrivers.indexOf(driver), 1);
            delete masterNode.outputDriverHash[driver.id];
        }

        res.json(driver);
    });
};

exports.driverById = function (req, res, next, id){
    if(!(req.driver = (masterNode.outputDriverHash[id] || masterNode.inputDriverHash[id]))){
        return res.status(400).send({
            message: 'Driver id not found'
        });
    }

    return next();
};
