'use strict';

angular.module('node').controller('nodeLinkListController', ['$scope', '$state', 'nodeService', '$location', '$window', 'Authentication',
    function ($scope, $state, nodeService, $location, $window, Authentication) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.links = [];

        $scope.init = function () {
            nodeService.getLinks().then(function(links){
                $scope.links = links;
            });
        };

        $scope.add = function(){
            $state.go('node.links.add');
        };

        $scope.edit = function(link){
            $state.go('node.links.edit', { linkId: link._id });
        };

        $scope.delete = function(link){
            nodeService.removeLink(link).then(function(){
                var index = $scope.links.indexOf(link);

                if(index !== -1){
                    $scope.links.splice(index, 1);
                }
            });
        };
    }
]);
