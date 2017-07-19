'use strict';

// Load the module dependencies
let config = rootRequire('./config/config.js'),
    path = require('path'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    socketio = require('socket.io'),
    mongoose = require('mongoose'),
    request = require('request'),
    NodeAPI = mongoose.model('NodeAPI'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    log = rootRequire('./modules/core/server/controllers/log.server.controller.js');

// Define the Socket.io configuration method
module.exports = function (app, db) {
    let server;

    if (config.secure && config.secure.ssl === true) {
        let options = {
            key: config.secure.key,
            cert: config.secure.cert,
            //    requestCert : true,
            //    rejectUnauthorized : true,
            secureProtocol: 'TLSv1_method',
            ciphers: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-ECDSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-ECDSA-AES256-GCM-SHA384',
                'DHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-SHA256',
                'DHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384',
                'DHE-RSA-AES256-SHA384',
                'ECDHE-RSA-AES256-SHA256',
                'DHE-RSA-AES256-SHA256',
                'HIGH',
                '!aNULL',
                '!eNULL',
                '!EXPORT',
                '!DES',
                '!RC4',
                '!MD5',
                '!PSK',
                '!SRP',
                '!CAMELLIA'
            ].join(':'),
            honorCipherOrder: true
        };

        // Create new HTTPS Server
        server = https.createServer(options, app);
    } else {
        // Create a new HTTP server
        server = http.createServer(app);
    }

    // Create a new Socket.io server
    let io = socketio.listen(server);

    // Create a MongoDB storage object
    let mongoStore = new MongoStore({
        mongooseConnection: db.connection,
        collection: config.sessionCollection
    });

    // Intercept Socket.io's handshake request
    let userAuth = function (socket, next) {
        // Use the 'cookie-parser' module to parse the request cookies
        cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
            // Get the session id from the request cookies
            let sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessionKey] : undefined;
            if (!sessionId){ return next(new Error('sessionId was not found in socket.request'), false); }

            // Use the mongoStorage instance to get the Express session information
            mongoStore.get(sessionId, function (err, session) {
                if (err){ return next(err, false); }
                if (!session){ return next(new Error('session was not found for ' + sessionId), false); }
                // Set the Socket.io session information
                socket.request.session = session;

                // Use Passport to populate the user details
                passport.initialize()(socket.request, {}, function () {
                    passport.session()(socket.request, {}, function () {
                        if (socket.request.user) {
                            next(null, true);
                        } else {
                            next(new Error('User is not authenticated'), false);
                        }
                    });
                });
            });
        });
    };

    let tokenAuth = function(socket, next){
        let token = socket.request.headers['x-token'];

        NodeAPI.findOne({ token: token }).lean().exec((err, data)=>{
            if (err || !(data || {}).token){
                log.error('Token Registration through Socket failure', err || { message: 'Token was not found' });
                return next(new Error('Incorrect or Missing Token'));
            }

            socket.request.token = data;
            next(null, true);
        });
    };

    io.use(function(socket, next){
        if (socket.request.headers['x-token']){
            tokenAuth(socket, next);
        } else {
            userAuth(socket, next);
        }
    });

    // Add an event listener to the 'connection' event
    io.on('connection', function (socket) {
        config.files.server.sockets.forEach(function (socketConfiguration) {
            require(path.resolve(socketConfiguration))(io, socket);
        });
    });

    return server;
};
