'use strict';

angular.module('node').controller('nodeListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.nodes = [];

        $scope.init = function () {
            nodeService.getNodes().then(function(nodes){
                $scope.nodes = nodes;
            });
        };

        if(Authentication.user.roles.indexOf('admin') !== -1){
            nodeService.getServerToken().then(function(token){
                $scope.token = token.token;
            });
        }

        $scope.updateNodes = function(){
            nodeService.updateNodes().then(function(){
                return nodeService.getNodes();
            }).then(function(nodes){
                $scope.nodes = nodes;
            });
        };

        $scope.addOutput = function(node){
            $state.go('node.nodes.edit.output', { nodeId: node.id });
        };

        $scope.addInput = function(node){
            $state.go('node.nodes.edit.input', { nodeId: node.id });
        };

        $scope.edit = function(node){
            $state.go('node.nodes.edit', { nodeId: node.id });
        };
    }
]);
