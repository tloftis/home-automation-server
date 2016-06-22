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
        state('node.nodes', {
            url: '/nodes',
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
        state('node.nodes.edit', {
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
        state('node.nodes.edit.output', {
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
        state('node.nodes.edit.input', {
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
        state('node.outputs.edit', {
            url: '/:outputId',
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
        state('node.inputs.edit', {
            url: '/:inputId',
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
        }).
        state('node.links', {
            url: '/links',
            bcName: 'Link Lists',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-link-list.client.view.html',
                    controller: 'nodeLinkListController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'List of Links',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        }).
        state('node.links.add', {
            url: '/create',
            bcName: 'Add Link',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-link-edit.client.view.html',
                    controller: 'nodeLinkCreateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Add Link',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        }).
        state('node.links.edit', {
            url: '/:linkId',
            bcName: 'Edit Link',
            bcInclude: true,
            views: {
                '@node': {
                    templateUrl: 'modules/node/client/views/node-link-edit.client.view.html',
                    controller: 'nodeLinkUpdateController'
                },
                'headerView@node': {
                    controller: function($scope) {
                        $scope.header = {
                            label: 'Edit Link',
                            desc: '',
                            faIcon: 'fa-circle fa-fw'
                        };
                    }
                }
            }
        });
    }
]);
