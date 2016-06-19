exports.funct = function(value, userInput, callback){
    setTimeout(function(){
        callback(value ? false : true);
    }, userInput || 0);

    callback(value ? true : false);
};
