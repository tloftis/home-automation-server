'use strict';

module.exports = {
    app: {
        title: 'Home Automation',
        description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js for a home automation system',
        keywords: 'mongodb, express, angularjs, node.js, mongoose, home-automation'
    },
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    uploads: {
        profileUpload: {
            dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
            limits: {
                fileSize: 5*1024*1024 // Max file size in bytes (1 MB)
            }
        }
    },
    secret: process.env.SERVER_SECRET || 'H0m34UT0'
};
