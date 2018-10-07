'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'); //This is a base for building up roles, it can store to a database but exists mainly in memory

// Using the memory backend, this means it will only exist in active memory
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function (){
    acl.allow([{
        roles: ['guest'],
        allows: [{
            resources: '/server-error',
            permissions: '*'
        }]
    }]);
};
