'use strict';

angular.module('node').controller('nodeLinkCreateController', ['$scope', '$state', 'nodeService', '$location', '$stateParams', 'Authentication',
    function ($scope, $state, nodeService, $location, $stateParams, Authentication) {
        var pipeHash = {};
        $scope.authentication = Authentication;
        $scope.link = {};
        $scope.link.pipes = [];
        $scope.outputs = [];
        $scope.inputs = [];
        $scope.pipes = [];

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
            });
        };

        $scope.update = function(){
            nodeService.addLink($scope.link).then(function(){
                $state.go('node.links');
            });
        };

        $scope.add = function(){
            $state.go('node.links.add');
        };

        $scope.addPipe = function(pipeId){
            if(!pipeHash[pipeId]){ return; }
            var index = $scope.link.pipes.push({ pipeId: pipeId }),
                pipe = pipeHash[pipeId];
            index--;

            $scope.link.pipes[index].name = pipe.name;
            $scope.link.pipes[index].description = pipe.description;
            $scope.link.pipes[index].userInType = pipe.userInType;
        };

        $scope.removePipe = function(pipeId){
            for(var i = 0; i < $scope.link.pipes.length; i++){
                if($scope.link.pipes[i].pipeId === pipeId){
                    $scope.link.pipes.splice(i, 1);
                    return;
                }
            }
        };

        $scope.pipeDown = function(index){
            if(index+1 >= $scope.link.pipes.length){
                return;
            }

            var item = $scope.link.pipes.splice(index, 1);
            $scope.link.pipes.splice(index+1, 0, item[0]);
        };

        $scope.pipeUp = function(index){
            if(!index){
                return;
            }

            var item = $scope.link.pipes.splice(index, 1);
            $scope.link.pipes.splice(index-1, 0, item[0]);
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
