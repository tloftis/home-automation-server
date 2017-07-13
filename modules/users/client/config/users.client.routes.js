'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider.
            state('user', {
                abstract: true,
                url: '/user',
                bcName: 'User',
                bcInclude: true,
                templateUrl: 'modules/users/client/views/users.client.view.html',
                controller: 'SettingsController'
            }).
            state('user.settings', {
                abstract: true,
                url: '/settings',
                bcName: 'Settings',
                bcInclude: true,
                bcReDirect: 'user.settings.profile',
                views: {
                    '@user': {
                        templateUrl: 'modules/users/client/views/settings/user-settings.client.view.html',
                        controller: 'SettingsController'
                    },
                    'headerView@user': {
                        controller: function($scope) {
                            $scope.header = {
                                label: 'User Settings',
                                desc: '',
                                faIcon: 'fa-user-md fa-fw'
                            };
                        }
                    }
                },
                data: {
                    roles: ['user', 'admin']
                }
            }).
            state('user.settings.profile', {
                url: '/profile',
                bcName: 'Profile',
                bcInclude: true,
                views: {
                    '@user.settings': {
                        templateUrl: 'modules/users/client/views/settings/user-edit-profile.client.view.html',
                        controller: 'EditProfileController'
                    },
                    'headerView@user': {
                        controller: function($scope) {
                            $scope.header = {
                                label: 'User Profile Settings',
                                desc: '',
                                faIcon: 'fa-user-md fa-fw'
                            };
                        }
                    }
                }
            }).
            state('user.settings.password', {
                url: '/password',
                bcName: 'Password',
                bcInclude: true,
                views: {
                    '@user.settings': {
                        templateUrl: 'modules/users/client/views/settings/user-change-password.client.view.html',
                        controller: 'ChangePasswordController'
                    },
                    'headerView@user': {
                        controller: function($scope) {
                            $scope.header = {
                                label: 'User Password Settings',
                                desc: '',
                                faIcon: 'fa-user-md fa-fw'
                            };
                        }
                    }
                }
            }).
            state('user.settings.picture', {
                url: '/picture',
                bcName: 'Picture',
                bcInclude: true,
                views: {
                    '@user.settings': {
                        templateUrl: 'modules/users/client/views/settings/user-change-profile-picture.client.view.html',
                        controller: 'ChangeProfilePictureController'
                    },
                    'headerView@user': {
                        controller: function($scope) {
                            $scope.header = {
                                label: 'User Profile Picture',
                                desc: '',
                                faIcon: 'fa-user-md fa-fw'
                            };
                        }
                    }
                }
            }).
            state('user.authentication', {
                url: '/authentication',
                abstract: true,
                bcInclude: true,
                bcName: 'Authentication',
                bcReDirect: 'user.authentication.signin'
            }).
            state('user.authentication.signin', {
                url: '/signin?err',
                views: {
                    '@user': {
                        templateUrl: 'modules/users/client/views/authentication/user-signin.client.view.html',
                        controller: 'AuthenticationController'
                    },
                    'headerView@user': {
                        controller: function ($scope) {
                            $scope.header = {
                                label: 'Sign In',
                                desc: '',
                                faIcon: 'fa-sign-in fa-fw'
                            };
                        }
                    }
                }
            });
    }
]);
