'use strict';

angular.module('node').controller('nodeOutputCreateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.output = {};
        $scope.drivers = [];

        $scope.init = function () {
            nodeService.getNode($stateParams.nodeId).then(function(node){
                $scope.node = node;
            });

            nodeService.getOutputDrivers().then(function(drivers){
                $scope.drivers = drivers;
            });
        };

        $scope.update = function(){
            nodeService.outputCreate($scope.node, $scope.output).then(function(){
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
        })
    }
]);
