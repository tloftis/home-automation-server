'use strict';

// Setting up route
angular.module('node').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider.
        state('node', {
            url: '/node',
            abstract: true,
            templateUrl: 'modules/node/client/views/node.client.view.html',
			data: {
			  roles: ['user', 'admin']
			}
        }).
        state('node.list', {
            url: '/list',
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-list.client.view.html',
                    controller: 'nodeListController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Nodes',
                            desc: '',
                            faIcon: 'fa-server fa-fw'
                        };
                    }
                }
            },
			data: {
			  roles: ['user', 'admin']
			}
        });
    }
]);
