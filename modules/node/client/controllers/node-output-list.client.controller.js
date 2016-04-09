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

        $scope.on = function(output){
            nodeService.outputSet(output, 1).then(function(newNode){
                var index = $scope.outputs.indexOf(output);
                $scope.outputs[index] = newNode;
            });
        };

        $scope.off = function(output){
            nodeService.outputSet(output, 0).then(function(newNode){
                var index = $scope.outputs.indexOf(output);
                $scope.outputs[index] = newNode;
            });
        };

        $scope.toggle = function(output){
            nodeService.outputSet(output).then(function(newNode){
                var index = $scope.outputs.indexOf(output);

                if(index !== -1){
                    $scope.outputs[index] = newNode;
                }
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
            $state.go('node.output.edit', { outputId: output.id });
        };
    }
]);
