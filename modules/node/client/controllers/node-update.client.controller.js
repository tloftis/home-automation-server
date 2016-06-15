'use strict';

angular.module('node').controller('nodeUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.node = {};

        $scope.init = function () {
            nodeService.getNode($stateParams.nodeId).then(function(node){
                $scope.node = node;
            });

            nodeService.getDrivers().then(function(drivers){
                $scope.drivers = drivers;
            });
        };

        $scope.update = function(node){
            nodeService.updateNode(node, node).then(function(newNode){
                $scope.node = newNode;
                $state.go('node.nodes');
            });
        };

        $scope.addDriver = function(driverId){
            nodeService.addDriver($scope.node, driverId).then(function(node){
                $scope.node = node
            });
        }
    }
]);
