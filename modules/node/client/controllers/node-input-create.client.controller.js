'use strict';

angular.module('node').controller('nodeInputCreateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
  function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
    if (!Authentication.user) {
      $location.path('/');
    }

    $scope.input = {};
    $scope.drivers = [];

    $scope.init = function () {
      nodeService.getNode($stateParams.nodeId).then(function(node){
        $scope.node = node;
        $scope.drivers = node.inputDrivers;
      });
    };

    $scope.update = function(){
      nodeService.inputCreate($scope.node, $scope.input).then(function(){
        $state.go('node.inputs');
      });
    };

    $scope.$watch('input.driverId', function(newVal, oldVal){
      if (newVal){
        for (var i = 0; i < $scope.drivers.length; i++){
          if ($scope.drivers[i].id === newVal){
            $scope.input.driver = $scope.drivers[i];
            return;
          }
        }
      }

      if (oldVal){
        $scope.output.driverId = oldVal;
      }
    });
  }
]);
