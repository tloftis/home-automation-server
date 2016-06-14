exports.funct = function(value, userInput, callback){
    if(value === userInput){
        return callback(value);
    }

    callback(undefined);
};
