'use strict';

angular.module('node').controller('nodeTokenListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.nodes = [];

        $scope.init = function () {
            nodeService.getTokens().then(function(tokens){
                $scope.tokens = tokens;
            });
        };

        $scope.enableDisable = function(token){
            nodeService.updateToken(token, { enabled: token.enabled }).then(function(){
                return nodeService.getTokens();
            }).then(function(tokens){
                $scope.tokens = tokens;
            });
        };

        $scope.create = function(){
            nodeService.createToken().then(function(token){
                $state.go('node.tokens.edit', { tokenId: token._id });
            });
        };

        $scope.remove = function(token){
            swal({
                title: '',
                text: 'Are you sure you want to delete this token?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes',
                closeOnConfirm: true
            }, function(){
                nodeService.removeToken(token).then(function(){
                    return nodeService.getTokens();
                }).then(function(tokens){
                    $scope.tokens = tokens;
                });
            });
        };

        $scope.edit = function(token){
            $state.go('node.tokens.edit', { tokenId: token._id });
        };
    }
]);
