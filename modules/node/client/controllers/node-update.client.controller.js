'use strict';

angular.module('node').controller('nodeUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.node = {};

        $scope.init = function () {
            nodeService.getNode($stateParams.nodeId).then(function(node){
                $scope.node = node;
            });
        };

        $scope.update = function(node){
            nodeService.updateNode(node, node).then(function(newNode){
                $scope.node = newNode;
                $state.go('node.nodes');
            });
        };
    }
]);
