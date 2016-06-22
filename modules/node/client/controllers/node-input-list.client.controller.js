'use strict';

angular.module('node').controller('nodeInputListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.inputs = [];

        $scope.init = function () {
            nodeService.getInputs().then(function(inputs){
                $scope.inputs = inputs;
            });
        };
        
        $scope.delete = function(input){
            nodeService.removeInput(input).then(function(){
                var index = $scope.inputs.indexOf(input);

                if(index !== -1){
                    $scope.inputs.splice(index, 1);
                }
            }).catch(function(err){
                console.log(err);
            });
        };

        $scope.edit = function(input){
            $state.go('node.inputs.edit', { inputId: input.id });
        };
    }
]);
