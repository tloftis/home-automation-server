'use strict';

angular.module('node').controller('nodeLinkUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        $scope.authentication = Authentication;
        $scope.link = {};
        $scope.outputs = [];
        $scope.inputs = [];

        $scope.init = function () {
            nodeService.getOutputs().then(function(outputs){
                $scope.outputs = outputs;
            });

            nodeService.getInputs().then(function(inputs){
                $scope.inputs = inputs;
            });

            nodeService.getLink($stateParams.linkId).then(function(link){
                $scope.link = link;
            });
        };

        $scope.update = function(link){
            nodeService.updateLink(link, link).then(function(){
                $state.go('node.links');
            });
        };

        $scope.$watch('link.outputId', function(newVal, oldVal){
            if(newVal){
                for(var i = 0; i < $scope.outputs.length; i++){
                    if($scope.outputs[i].id === newVal){
                        $scope.link.output = $scope.outputs[i];
                        return;
                    }
                }
            }

            if(oldVal){
                $scope.link.outputId = oldVal;
            }
        });

        $scope.$watch('link.inputId', function(newVal, oldVal){
            if(newVal){
                for(var i = 0; i < $scope.inputs.length; i++){
                    if($scope.inputs[i].id === newVal){
                        $scope.link.input = $scope.inputs[i];
                        return;
                    }
                }
            }

            if(oldVal){
                $scope.link.inputId = oldVal;
            }
        });
    }
]);
