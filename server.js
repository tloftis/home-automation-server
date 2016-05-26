'use strict';

require('dotenv').load();

require('./config/lib/app').start(function(app, db, config){
    if(config.secure.ssl && (config.port !== 80)){
        var redirectApp = require('express')();

        redirectApp.get('*',function(req,res){
            res.redirect('https://' + req.get('host') + req.url);
        });

        redirectApp.listen(80, function(){
            console.log('Redirecting HTTP traffic to HTTPS');
        });
    }
});
