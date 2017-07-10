'use strict';

angular.module('node').controller('nodeUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
  function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
    if (!Authentication.user) {
      $location.path('/');
    }

    $scope.node = {};

    $scope.init = function () {
      nodeService.getNode($stateParams.nodeId).then(function(node){
        $scope.node = node;
      });

      nodeService.getDrivers().then(function(drivers){
        $scope.drivers = drivers;
      });
    };

    $scope.update = function(node){
      nodeService.updateNode(node, node).then(function(newNode){
        $scope.node = newNode;
        $state.go('node.nodes');
      });
    };

    $scope.addDriver = function(driver){
      nodeService.addDriver($scope.node, driver).then(function(node){
        $scope.node = node
      });
    };

    $scope.removeDriver = function(driver){
      nodeService.removeDriver(driver).then(function(){
        var index;

        if ((index = $scope.node.inputDrivers.indexOf(driver)) !== -1){
          $scope.node.inputDrivers.splice(index, 1);
          return;
        }

        if ((index = $scope.node.outputDrivers.indexOf(driver)) !== -1){
          $scope.node.outputDrivers.splice(index, 1);
        }
      });
    };
  }
]);
