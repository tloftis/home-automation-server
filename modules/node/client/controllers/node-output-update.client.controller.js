'use strict';

angular.module('node').controller('nodeOutputUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.output = {};
        $scope.drivers = [];
        $scope.options = [];

        $scope.init = function () {
            nodeService.getOutput($stateParams.outputId).then(function(output){
                $scope.output = output;
            });

            nodeService.getOutputDrivers().then(function(drivers){
                $scope.drivers = drivers;
            });
        };

        $scope.update = function(output){
            nodeService.outputUpdate(output, output).then(function(newNode){
                $scope.output = newNode;
                $state.go('node.outputs');
            });
        };
    }
]);
