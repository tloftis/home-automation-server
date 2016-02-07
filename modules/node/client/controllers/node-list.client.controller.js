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

        $scope.on = function(node){
            nodeService.nodeSet(node, 1).then(function(newNode){
                var index = $scope.nodes.indexOf(node);
                $scope.nodes[index] = newNode;
            });
        };

        $scope.off = function(node){
            nodeService.nodeSet(node, 0).then(function(newNode){
                var index = $scope.nodes.indexOf(node);
                $scope.nodes[index] = newNode;
            });
        };

        $scope.toggle = function(node){
            nodeService.nodeSet(node).then(function(newNode){
                var index = $scope.nodes.indexOf(node);
                $scope.nodes[index] = newNode;
            });
        };
    }
]);
