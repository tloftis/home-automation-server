'use strict';

/* globals swal: true */

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', 'Utility',
    function ($scope, $filter, Admin, Utility) {
        $scope.sortBy = 'username';

        Admin.updateUser.query(function (data) {
            $scope.users = data;
            $scope.figureOutItemsToDisplay();
        });

        $scope.remove = function (user) {
            swal({
                title:'',
                text: 'Are you sure you want to delete this user?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes',
                closeOnConfirm: true
            }, function(){
                if (user) {
                    user.$remove(function(){
                        Utility.log.success('User Removed!');
                        $scope.users.splice($scope.users.indexOf(user), 1);
                        $scope.figureOutItemsToDisplay();
                    });
                } else {
                    $scope.user.$remove(function () {
                        Utility.log.success('User Removed!');
                    });
                }
            });
        };

        $scope.pagingConfig = {
            currentPage: 1,
            pagedItems: [],
            itemsPerPage: 10,
            search: '',
            end: 0,
            begin: 0,
            total: 0
        };

        $scope.figureOutItemsToDisplay = function () {
            var filteredItems = $filter('filter')($scope.users, {
                $: $scope.pagingConfig.search
            });

            $scope.pagingConfig.total = filteredItems.length;
            $scope.pagingConfig.begin = (($scope.pagingConfig.currentPage - 1) * $scope.pagingConfig.itemsPerPage);
            $scope.pagingConfig.end = $scope.pagingConfig.begin + (+$scope.pagingConfig.itemsPerPage);
            $scope.pagingConfig.pagedItems = filteredItems;
        };
    }
]);
