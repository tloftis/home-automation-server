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
                            label: 'List Nodes',
                            desc: 'all found nodes',
                            faIcon: 'fa-server fa-fw'
                        };
                    }
                }
            },
            data: {
                roles: ['user', 'admin']
            }
        }).
        state('node.edit', {
            url: '/:nodeId',
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-edit.client.view.html',
                    controller: 'nodeUpdateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Edit Node',
                            desc: '',
                            faIcon: 'fa-server fa-fw'
                        };
                    }
                }
            },
            data: {
                roles: ['user', 'admin']
            }
        }).
        state('node.add', {
            url: '/:nodeId',
            abstract: true
        }).
        state('node.add.output', {
            url: '/output',
            bcName: 'Add Output',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-output-edit.client.view.html',
                    controller: 'nodeOutputCreateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Add Output',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        }).
        state('node.add.input', {
            url: '/input',
            bcName: 'Add Input',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-input-edit.client.view.html',
                    controller: 'nodeInputCreateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Add Input',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        }).
        state('node.outputs', {
            url: '/outputs',
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-output-list.client.view.html',
                    controller: 'nodeOutputListController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Output Nodes',
                            desc: 'all outputs of all known nodes',
                            faIcon: 'fa-server fa-fw'
                        };
                    }
                }
            },
			data: {
			  roles: ['user', 'admin']
			}
        }).
        state('node.inputs', {
            url: '/inputs',
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-input-list.client.view.html',
                    controller: 'nodeInputListController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Input Nodes',
                            desc: 'all inputs of all known nodes',
                            faIcon: 'fa-server fa-fw'
                        };
                    }
                }
            },
            data: {
                roles: ['user', 'admin']
            }
        }).
        state('node.output', {
            url: '/output/:outputId',
            abstract: true,
            bcReDirect: 'node.outputs',
            bcName: 'Output',
            bcInclude: true
        }).
        state('node.input', {
            url: '/input/:inputId',
            abstract: true,
            bcReDirect: 'node.inputs',
            bcName: 'Input',
            bcInclude: true
        }).
        state('node.output.edit', {
            url: '/edit',
            bcName: 'Edit Output',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-output-edit.client.view.html',
                    controller: 'nodeOutputUpdateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Edit Output',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        }).
        state('node.input.edit', {
            url: '/edit',
            bcName: 'Edit Input',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-input-edit.client.view.html',
                    controller: 'nodeInputUpdateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Edit Input',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        });
    }
]);
