'use strict';

// Configuring the Articles module
angular.module('node').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Relay Nodes',
            state: 'node',
            type: 'dropdown',
            roles: ['user', 'admin']
        });

        Menus.addSubMenuItem('topbar', 'node', {
            title: 'Node Output List',
            state: 'node.outputs'
        });

        Menus.addSubMenuItem('topbar', 'node', {
            title: 'Node Input List',
            state: 'node.inputs'
        });

        Menus.addSubMenuItem('topbar', 'node', {
            title: 'Node List',
            state: 'node.list'
        });
    }
]);

