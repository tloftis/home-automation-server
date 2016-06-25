exports.funct = function(value, userInput, data, callback){
    setTimeout(function(){
        callback(value);
    }, userInput || 0);

    callback(value);
};
