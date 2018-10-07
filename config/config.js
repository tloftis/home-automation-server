'use strict';

let _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');

/**
 * Get files by glob patterns
 */
let getGlobbedPaths = function (globPatterns, excludes) {
    // URL paths regex
    let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    let output = [];

    // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            let files = glob.sync(globPatterns);

            if (excludes) {
                files = files.map(function (file) {
                    if (_.isArray(excludes)) {
                        for (let i in excludes) {
                            file = file.replace(excludes[i], '');
                        }
                    } else {
                        file = file.replace(excludes, '');
                    }

                    return file;
                });
            }

            output = _.union(output, files);
        }
    }

    return output;
};

let validateEnvironmentVariable = function () {
    let environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('+ Error: NODE_ENV is not defined! Using default development environment'));
        }

        process.env.NODE_ENV = 'development';
    }
    // Reset console color
    console.log(chalk.white(''));
};

let validateSecureMode = function (config) {

    if (!config.secure || config.secure.ssl !== true) {
        return true;
    }

    let privateKey = fs.existsSync(path.resolve(config.secure.privateKey));
    let certificate = fs.existsSync(path.resolve(config.secure.certificate));

    if (!privateKey || !certificate) {
        console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
        console.log(chalk.red('    To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
        console.log();
        config.secure.ssl = false;
    }
};

let initGlobalConfigFiles = function (config, assets) {
    // Appending files
    config.files = {
        server: {}
    };

    // Setting Globbed model files
    config.files.server.models = getGlobbedPaths(assets.server.models);

    // Setting Globbed route files
    config.files.server.routes = getGlobbedPaths(assets.server.routes);

    // Setting Globbed config files
    config.files.server.configs = getGlobbedPaths(assets.server.config);

    // Setting Globbed socket files
    config.files.server.sockets = getGlobbedPaths(assets.server.sockets);

    // Setting Globbed policies files
    config.files.server.policies = getGlobbedPaths(assets.server.policies);
};

let initGlobalConfig = function () {
    // Validate NODE_ENV existence
    validateEnvironmentVariable();

    // Get the default assets
    let defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));

    // Get the current assets
    let environmentAssets = require(path.join(process.cwd(), 'config/assets/', process.env.NODE_ENV)) || {};

    // Merge assets
    let assets = _.merge(defaultAssets, environmentAssets);

    // Get the default config
    let defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    let environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    let config = _.merge(defaultConfig, environmentConfig);

    // read package.json for MEAN.JS project information
    config.meanjs = require(path.resolve('./package.json'));

    // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
    config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js')) && require(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js'))) || {});

    // Initialize global globbed files
    initGlobalConfigFiles(config, assets);

    // Validate Secure SSL mode can be used
    validateSecureMode(config);

    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths,
        policyValidator : policyValidator
    };

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
