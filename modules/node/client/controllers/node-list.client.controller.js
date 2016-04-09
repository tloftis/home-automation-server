'use strict';

angular.module('node').controller('nodeListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        $scope.authentication = Authentication;
        $scope.nodes = [];

        $scope.init = function () {
            nodeService.getNodes().then(function(nodes){
                $scope.nodes = nodes;
            });
        };

        $scope.addOutput = function(node){
            $state.go('node.add.output', { nodeId: node.id });
        };

        $scope.addInput = function(node){
            $state.go('node.add.input', { nodeId: node.id });
        };

        $scope.edit = function(node){
            $state.go('node.edit', { nodeId: node.id });
        };
    }
]);
