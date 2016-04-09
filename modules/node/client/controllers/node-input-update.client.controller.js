'use strict';

angular.module('node').controller('nodeInputUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.input = {};

        $scope.init = function () {
            nodeService.getInput($stateParams.inputId).then(function(input){
                $scope.input = input;
                $scope.input.pin = +$scope.input.pin;
            });
        };

        $scope.update = function(input){
            nodeService.inputUpdate(input, input).then(function(newNode){
                $scope.input = newNode;
                $scope.input.pin = +$scope.input.pin;

                $state.go('node.inputs');
            });
        };
    }
]);
