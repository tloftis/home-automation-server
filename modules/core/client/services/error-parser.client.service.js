'use strict';
angular.module('core').factory('MessageParserService', [
    function () {
        var MessageParserService = {
            parseMessage: function (error) {
                var message = '';
                if (_.isString(error)) {
                    message = error;
                }else if (_.isObject(error) && _.isString(error.message)) {
                    message = error.message;
                }else if (_.isObject(error) && _.isString(error.error)) {
                    message = error.error;
                }else if (_.isObject(error) && _.isObject(error.data) && _.isString(error.data.message)) {
                    message = error.data.message;
                }else{
                    message = 'Message Parser Server Unknown Error - Logged to console!';
                }

                if (message.length > 255) {
                    message = 'Message Parser Server Error: Longer than 255 characters - Logged to console!';
                }

                return message;
            }
        };

        return MessageParserService;
    }]
);