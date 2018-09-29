'use strict';

module.exports = {
    server: {
        gruntConfig: ['gruntfile.js'],
        gulpConfig: ['gulpfile.js'],
        allJS: ['server.js', 'config/**/*.js', 'modules/*/**/*.js'],
        models: 'modules/*/models/**/*.js',
        routes: ['modules/!(core)/routes/**/*.js', 'modules/core/routes/**/*.js'],
        sockets: 'modules/*/sockets/**/*.js',
        config: ['modules/*/config/*.js'],
        policies: 'modules/*/policies/*.js'
    }
};
