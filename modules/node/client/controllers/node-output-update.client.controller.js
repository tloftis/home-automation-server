'use strict';

angular.module('node').controller('nodeOutputUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.output = {};

        $scope.init = function () {
            nodeService.getOutput($stateParams.outputId).then(function(output){
                $scope.output = output;
                $scope.output.pin = +$scope.output.pin;
            });
        };

        $scope.update = function(output){
            nodeService.outputUpdate(output, output).then(function(newNode){
                $scope.output = newNode;
                $scope.output.pin = +$scope.output.pin;

                $state.go('node.outputs');
            });
        };
    }
]);
