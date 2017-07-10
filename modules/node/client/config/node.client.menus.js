'use strict';

// Configuring the Articles module
angular.module('node').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Nodes',
      state: 'node',
      type: 'dropdown',
      roles: ['user', 'admin']
    });

    Menus.addSubMenuItem('topbar', 'node', {
      title: 'Node Output List',
      state: 'node.outputs',
      roles: ['user', 'admin']
    });

    Menus.addSubMenuItem('topbar', 'node', {
      title: 'Node Input List',
      state: 'node.inputs',
      roles: ['user', 'admin']
    });

    Menus.addSubMenuItem('topbar', 'node', {
      title: 'Node List',
      state: 'node.nodes',
      roles: ['user', 'admin']
    });

    Menus.addSubMenuItem('topbar', 'node', {
      title: 'Node Token List',
      state: 'node.tokens',
      roles: ['admin']
    });

    Menus.addSubMenuItem('topbar', 'node', {
      title: 'API Token List',
      state: 'node.api-tokens',
      roles: ['admin']
    });
  }
]);

