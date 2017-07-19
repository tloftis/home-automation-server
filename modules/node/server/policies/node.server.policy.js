'use strict';

/**
 * Module dependencies.
 */
let acl = require('acl'); // This is a base for building up roles, it can store to a database but exists mainly in memory

// Using the memory backend, this means it will only exist in active memory
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function (){
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/node',
            permissions: '*'
        }, {
            resources: '/api/node/server-token',
            permissions: '*'
        }, {
            resources: '/api/node/:nodeId',
            permissions: '*'
        }, {
            resources: '/api/node/:nodeId/output',
            permissions: '*'
        }, {
            resources: '/api/node/:nodeId/input',
            permissions: '*'
        }, {
            resources: '/api/node/:nodeId/driver',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/node',
            permissions: ['get']
        }, {
            resources: '/api/node/:nodeId',
            permissions: ['get', 'post']
        }]
    }, {
        roles: ['guest'],
        allows: [{
            resources: '/api/node/:nodeId',
            permissions: ['post']
        }]
    }]);
};

exports.isAllowed = function (req, res, next){
    let roles = (req.user) ? req.user.roles : ['guest'];
    let enabled = roles.indexOf('guest') === -1 ? (req.user || {}).enabled : true;

    // Confirm user is enabled
    if (enabled === false){
        req.logout();
        return res.status(401).send('User Account Is Disabled!');
    } else if (typeof enabled === 'undefined'){
        req.logout();
        return res.status(401).send('User Information Is Incorrect!');
    }

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed){
        if (err){
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
