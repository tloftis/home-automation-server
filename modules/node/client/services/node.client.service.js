'use strict';

angular.module('node').service('nodeService', ['Utility',
    function (Utility) {
        var service = {};

        service.getOutputs = function (){
            return Utility.http.get('output');
        };

        service.getInputs = function (){
            return Utility.http.get('input');
        };

        service.getNodes = function (){
            return Utility.http.get('node');
        };

        service.getNode = function (node){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.get('node/' + id);
        };

        service.updateNode = function (node, config){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.put('node/' + id, {node: config});
        };

        service.getOutput = function (node){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.get('output/' + id);
        };

        service.getInput = function (node){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.get('input/' + id);
        };


        service.removeOutput = function (node){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.delete('output/' + id, {});
        };

        service.removeInput = function (node){
            var id = node;
            if(node && node.id) id = node.id;

            return Utility.http.delete('input/' + id, {});
        };

        service.outputSet = function(node, val){
            var id = node,
                value = {};

            if(node && node.id) id = node.id;

            if(!_.isUndefined(val)){
                value.value = val;
            }

            return Utility.http.post('output/' + id + '/set', value);
        };

        service.outputUpdate = function(node, newNode){
            var id = node;
            if(node && node.id) id = node.id;
            return Utility.http.put('output/' + id, { node: newNode});
        };

        service.inputUpdate = function(node, newNode){
            var id = node;
            if(node && node.id) id = node.id;
            return Utility.http.put('input/' + id, { node: newNode});
        };

        service.outputCreate = function(node, newNode){
            var id = node;
            if(node && node.id) id = node.id;
            return Utility.http.post('node/' + id + '/output', { output: newNode});
        };

        service.inputCreate = function(node, newNode){
            var id = node;
            if(node && node.id) id = node.id;
            return Utility.http.post('node/' + id + '/input', { input: newNode});
        };

        return service;
    }
]);
