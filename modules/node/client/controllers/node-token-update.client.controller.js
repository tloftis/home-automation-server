'use strict';

angular.module('node').controller('nodeTokenUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
  function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
    if (!Authentication.user) {
      $location.path('/');
    }

    $scope.init = function () {
      nodeService.getToken($stateParams.tokenId).then(function(token){
        return $scope.token = token;
      });
    };

    $scope.update = function(token){
      nodeService.updateToken(token, token).then(function(token){
        $scope.token = token;
        $state.go('node.tokens');
      });
    };
  }
]);
