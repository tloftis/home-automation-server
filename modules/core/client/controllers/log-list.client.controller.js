'use strict';

angular.module('node').controller('nodeListController', ['$scope', '$state', 'logger', '$location', '$window', 'Authentication',
    function ($scope, $state, logger, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.logs = [];

        $scope.init = function () {
            logger.getLogs().then(function(logs){
                $scope.logs = logs;
            });
        };

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
