'use strict';

// Configuring the Articles module
angular.module('node').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Relay Nodes',
            state: 'node',
            type: 'dropdown',
            roles: ['admin']
        });

        Menus.addSubMenuItem('topbar', 'node', {
            title: 'Node List',
            state: 'node.list'
        });
    }
]);

