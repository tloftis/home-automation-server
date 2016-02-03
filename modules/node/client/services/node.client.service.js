'use strict';

angular.module('node').service('nodeService', ['Utility',
    function (Utility) {
        var service = {};

        service.getNodes = function (){
            return Utility.http.get('node/list');
        };

        service.nodeSet = function(node, val){
            return Utility.http.post('node/set', { node: node, val: val });
        };

        return service;
    }
]);