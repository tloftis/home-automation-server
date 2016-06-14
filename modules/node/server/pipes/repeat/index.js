exports.funct = function(value, userInput, callback){
    setTimeout(function(){
        callback(value);
    }, userInput || 0);

    callback(value);
};
