'use strict';

/**
 * Module dependencies.
 */
const config = require('../config'),
    mongoose = require('./mongoose'),
    express = require('./express'),
    chalk = require('chalk');

module.exports.init = function init(callback) {
    mongoose.connect(function (db) {
        // Initialize express
        let app = express.init(db);
        if (callback) callback(app, db, config);

    });
};

module.exports.start = function start(callback) {
    let _this = this;

    mongoose.loadModels();
    _this.init((app, db, config) => {

        // Start the app by listening on <port> at <host>
        app.listen(config.port, config.host, function () {
            // Create server URL
            let server = (process.env.NODE_ENV === 'secure' ? 'https://' : 'http://') + config.host + ':' + config.port;
            // Logging initialization
            console.log('--');
            console.log(chalk.green(config.app.title));
            console.log();
            console.log(chalk.green('Environment:         ' + process.env.NODE_ENV));
            console.log(chalk.green('Server:                    ' + server));
            console.log(chalk.green('Database:                ' + config.db.uri));
            console.log(chalk.green('App version:         ' + config.meanjs.version));
            if (config.meanjs['meanjs-version'])
                console.log(chalk.green('MEAN.JS version: ' + config.meanjs['meanjs-version']));
            console.log('--');

            if (callback) callback(app, db, config);
        });

    });

};
