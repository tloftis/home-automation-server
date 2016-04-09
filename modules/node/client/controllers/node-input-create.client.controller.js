'use strict';

angular.module('node').controller('nodeInputCreateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.input = {};

        $scope.init = function () {
        };

        $scope.update = function(input){
            nodeService.inputCreate($stateParams.nodeId, $scope.input).then(function(input){
                $state.go('node.list');
            });
        };
    }
]);
