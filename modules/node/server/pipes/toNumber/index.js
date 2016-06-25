exports.funct = function(value, userInput, data, callback){
    var out = +value;

    if(isNaN(out)){
        out = 0;
    }

    return callback(out);
};
