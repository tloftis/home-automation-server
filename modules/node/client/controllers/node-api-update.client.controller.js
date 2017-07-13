'use strict';

angular.module('node').controller('nodeApiUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.node = {};
        $scope.possiblePermissions = [];
        $scope.nodes = {};

        $scope.init = function () {
            nodeService.getApiToken($stateParams.tokenId).then(function(token){
                return $scope.token = token;
            }).then(function(token){
                nodeService.getInputs().then(function(inputs){
                    inputs.forEach(function (input){
                        $scope.nodes[input.id] = input;

                        if (token.permissions.indexOf(input.id) === -1){
                            $scope.possiblePermissions.push(input.id);
                        }
                    })
                });

                nodeService.getOutputs().then(function(outputs){
                    outputs.forEach(function (output){
                        $scope.nodes[output.id] = output;

                        if (token.permissions.indexOf(output.id) === -1){
                            $scope.possiblePermissions.push(output.id);
                        }
                    })
                });
            });
        };

        $scope.update = function(token){
            nodeService.updateApiToken(token, token).then(function(token){
                $scope.token = token;
                $state.go('node.api-tokens');
            });
        };
    }
]);
