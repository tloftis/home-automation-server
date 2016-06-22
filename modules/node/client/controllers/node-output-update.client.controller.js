'use strict';

angular.module('node').controller('nodeOutputUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.output = {};
        $scope.drivers = [];

        $scope.init = function () {
            nodeService.getOutput($stateParams.outputId).then(function(output){
                $scope.output = output;
                $scope.drivers = output.node.outputDrivers;
            });
        };

        $scope.update = function(output){
            nodeService.outputUpdate(output, output).then(function(newNode){
                $scope.output = newNode;
                $state.go('node.outputs');
            });
        };

        $scope.$watch('output.driverId', function(newVal, oldVal){
            if(newVal){
                for(var i = 0; i < $scope.drivers.length; i++){
                    if($scope.drivers[i].id === newVal){
                        $scope.output.driver = $scope.drivers[i];
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
