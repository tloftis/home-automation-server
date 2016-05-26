'use strict';

angular.module('node').controller('nodeOutputListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        $scope.authentication = Authentication;
        $scope.outputs = [];

        $scope.init = function () {
            nodeService.getOutputs().then(function(outputs){
                $scope.outputs = outputs;
            });
        };

        $scope.set = function(output, value){
            nodeService.outputSet(output, value).then(function(newNode){
                var index = $scope.outputs.indexOf(output);
                $scope.outputs[index] = newNode;
            });
        };

        $scope.delete = function(output){
            nodeService.removeOutput(output).then(function(newNode){
                var index = $scope.outputs.indexOf(output);

                if(index !== -1){
                    $scope.outputs.splice(index, 1);
                }
            });
        };

        $scope.edit = function(output){
            $state.go('node.outputs.edit', { outputId: output.id });
        };
    }
]);
