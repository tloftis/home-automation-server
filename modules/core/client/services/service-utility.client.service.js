'use strict';

angular.module('core').factory('Utility', ['$q', '$http', 'MessageParserService',
    function ($q, $http, MessageParserService) {
        var service = {};
        var parseErrorMessage = MessageParserService.parseMessage;

        service.log = {
            _post: function (type, msg, consoleType) {
                //when in development mode, log these messages to the console as well
                if (window.env === 'development'){
                    if(type === 'error'){
                        console.error(msg, (new Error(msg)));
                    }else{
                        console[consoleType || type](msg);
                    }
                }

                if (['error', 'success', 'warning'].indexOf(type) > -1) {
                    msg = msg.message ? msg.message : msg;
                    console.log(msg);
                }

            },
            debug: function (msg) {
                this._post('debug', msg);
            },
            success: function (msg) {
                this._post('success', msg, 'info');
            },
            warning: function (msg) {
                this._post('warning', msg, 'warn');
            },
            error: function (msg) {
                this._post('error', msg);
            }
        };

        service.http = {
            get: function (rt, params) {

                var deferred = $q.defer(),
                    query = {};

                query.params = params || {};

                $http.get('/api/' + rt, query)
                    .success(function (data) {
                        service.log.debug('GET ' + rt + ': success');
                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        var errMsg = 'GET ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data) + '\'';
                        service.log.error(errMsg);
                        deferred.reject();
                    });

                return deferred.promise;
            },

            post: function (rt, payload) {
                var deferred = $q.defer();
                $http.post('/api/' + rt, payload)
                    .success(function (data) {
                        service.log.debug('POST ' + rt + ': success');

                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        var errMsg = 'POST ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data) + '\'';
                        service.log.error(errMsg);
                        deferred.reject();
                    });
                return deferred.promise;
            },

            put: function (rt, payload) {
                var deferred = $q.defer();
                $http.put('/api/' + rt, payload)
                    .success(function (data) {
                        service.log.debug('PUT ' + rt + ': success');

                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        var errMsg = 'PUT ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data) + '\'';
                        service.log.error(errMsg);
                        deferred.reject();
                    });
                return deferred.promise;
            },

            delete: function (rt, payload) {
                var deferred = $q.defer();
                $http.delete('/api/' + rt, payload)
                    .success(function (data) {
                        service.log.debug('DELETE ' + rt + ': success');

                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        var errMsg = 'DELETE ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data) + '\'';
                        service.log.error(errMsg);
                        deferred.reject();
                    });
                return deferred.promise;
            }
        };

        return service;
    }]
);
