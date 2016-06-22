'use strict';

angular.module('users').controller('UsersLogController', ['$scope', '$state', 'usersService', '$location', '$window', 'Authentication', '$filter',
    function ($scope, $state, usersService, $location, $window, Authentication, $filter) {
        if (!Authentication.user) {
            $location.path('/');
        }

        $scope.moment = moment;
        $scope.currentMeta ={};
        $scope.showMeta = false;

        $scope.init = function () {
            usersService.getLogs(true).then(function (logs) {
                //Convert over string dates to actual javascript date objects
                for(var i = 0; i< logs.length; i++){
                    logs[i].created = new Date(logs[i].created);
                }

                $scope.logs = logs;
                $scope.figureOutItemsToDisplay();
            });
        };

        $scope.goToUser = function(userId){
            $state.go('admin.users.user.view', { userId: userId });
        };

        $scope.meta = function(data){
            if($scope.showMeta && data === $scope.currentMeta){
                $scope.showMeta = false;
                return;
            }

            if(data){
                $scope.showMeta = true;
                $scope.currentMeta = data;
            }else{
                $scope.showMeta = false;
            }
        };

        $scope.pagingConfig = {
            currentPage: 1,
            pagedItems: [],
            itemsPerPage: 5,
            search: '',
            end: 0,
            begin: 0,
            total: 0
        };

        $scope.sortBy = 'created';

        $scope.figureOutItemsToDisplay = function () {
            var filteredItems = $filter('filter')($scope.logs, {
                $: $scope.pagingConfig.search
            });

            $scope.pagingConfig.total = filteredItems.length;
            $scope.pagingConfig.begin = (($scope.pagingConfig.currentPage - 1) * $scope.pagingConfig.itemsPerPage);
            $scope.pagingConfig.end = $scope.pagingConfig.begin + (+$scope.pagingConfig.itemsPerPage);
            $scope.pagingConfig.pagedItems = filteredItems;
        };
    }
]);
