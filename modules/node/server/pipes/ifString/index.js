exports.funct = function(value, userInput, data, callback){
    if(value){
        return callback(userInput);
    }

    callback(undefined);
};
