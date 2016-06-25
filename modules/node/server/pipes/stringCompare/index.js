exports.funct = function(value, userInput, data, callback){
    if(value === userInput){
        return callback(value);
    }

    callback(undefined);
};
