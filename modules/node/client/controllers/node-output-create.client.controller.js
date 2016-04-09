'use strict';

angular.module('node').controller('nodeOutputCreateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.output = {};

        $scope.init = function () {
            nodeService.getNode($stateParams.nodeId).then(function(node){
                $scope.node = node;
            });
        };

        $scope.update = function(output){
            nodeService.outputCreate($scope.node, $scope.output).then(function(output){
                $state.go('node.list');
            });
        };
    }
]);
