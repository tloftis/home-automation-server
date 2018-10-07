'use strict';

require('dotenv').load();
global.rootDir = __dirname;

global.rootRequire = str => {
    return require(str);
};

global.rootRequire.resolve = str => {
    return require.resolve(str);
};

require('./config/lib/app').start((app, db, config) => {
    if(config.secure.ssl && (config.port !== 80)){
        let redirectApp = require('express')();

        redirectApp.get('*',(req,res) => {
            res.redirect(`https://${req.get('host')}:${config.port}${req.url}`);
        });

        redirectApp.listen(80, () => {
            console.log('Redirecting HTTP traffic to HTTPS');
        });
    }
});
