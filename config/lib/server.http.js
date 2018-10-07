'use strict';

// Load the module dependencies
const config = require('../config'),
    path = require('path'),
    fs = require('fs'),
    http = require('http'),
    https = require('https');

// Define the Socket.io configuration method
module.exports = function (app, db) {
    let server;

    if (config.secure && config.secure.ssl === true) {
        // Load SSL key and certificate
        let privateKey = fs.readFileSync(path.resolve(config.secure.privateKey), 'utf8');
        let certificate = fs.readFileSync(path.resolve(config.secure.certificate), 'utf8');

        let options = {
            key: privateKey,
            cert: certificate,
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

    return server;
};
