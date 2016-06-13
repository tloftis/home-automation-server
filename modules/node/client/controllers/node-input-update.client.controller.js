'use strict';

angular.module('node').controller('nodeInputUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.input = {};
        $scope.drivers = [];

        $scope.init = function () {
            nodeService.getInput($stateParams.inputId).then(function(input){
                $scope.input = input;
                $scope.drivers = input.node.inputDrivers;
            });
        };

        $scope.update = function(){
            nodeService.inputUpdate($scope.input, $scope.input).then(function(){
                $state.go('node.inputs');
            });
        };

        $scope.$watch('input.driverId', function(newVal, oldVal){
            if(newVal){
                for(var i = 0; i < $scope.drivers.length; i++){
                    if($scope.drivers[i].id === newVal){
                        $scope.input.driver = $scope.drivers[i];
                        return;
                    }
                }
            }

            if(oldVal){
                $scope.output.driverId = oldVal;
            }
        });
    }
]);
