'use strict';

angular.module('node').controller('nodeApiListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.nodes = [];

        $scope.init = function () {
            nodeService.getApiTokens().then(function(tokens){
                $scope.tokens = tokens;
            });
        };

        $scope.enableDisable = function(token){
            nodeService.updateApiToken(token, { enabled: token.enabled }).then(function(){
                return nodeService.getApiTokens();
            }).then(function(tokens){
                $scope.tokens = tokens;
            });
        };

        $scope.create = function(){
            nodeService.createApiToken({}).then(function(token){
                $state.go('node.api-tokens.edit', { tokenId: token._id });
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
                nodeService.removeApiToken(token).then(function(){
                    return nodeService.getApiTokens();
                }).then(function(tokens){
                    $scope.tokens = tokens;
                });
            });
        };

        $scope.edit = function(token){
            $state.go('node.api-tokens.edit', { tokenId: token._id });
        };
    }
]);
