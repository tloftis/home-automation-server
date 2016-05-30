'use strict';

angular.module('node').controller('nodeLinkUpdateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        var pipeHash = {};
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

            nodeService.getPipes().then(function(pipes){
                $scope.pipes = pipes;

                for(var i = 0; i < pipes.length; i++){
                    pipeHash[pipes[i].id] = pipes[i];
                }

                return nodeService.getLink($stateParams.linkId);
            }).then(function(link){
                var pipe;
                $scope.link = link;

                for(var i = 0; i < link.pipes.length; i++){
                    pipe = pipeHash[link.pipes[i].id];
                    link.pipes[i].name = pipe.name;
                    link.pipes[i].description = pipe.description;
                }
            });
        };

        $scope.update = function(link){
            nodeService.updateLink(link, link).then(function(){
                $state.go('node.links');
            });
        };

        $scope.removePipe = function(pipeId){
            for(var i = 0; i < $scope.link.pipes.length; i++){
                if($scope.link.pipes[i].id === pipeId){
                    $scope.link.pipes.splice(i, 1);
                    return;
                }
            }
        };

        $scope.addPipe = function(pipeId){
            var index = $scope.link.pipes.push({ id: pipeId }),
                pipe = pipeHash[pipeId];
            index--;

            $scope.link.pipes[index].name = pipe.name;
            $scope.link.pipes[index].description = pipe.description;
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
