exports.funct = function(value, userInput, callback){
    if(value){
        return callback(userInput);
    }

    callback(undefined);
};
