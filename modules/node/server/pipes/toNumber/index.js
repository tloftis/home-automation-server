exports.funct = function(value, userInput, callback){
    var out = +value;

    if(isNaN(out)){
        out = 0;
    }

    return callback(out);
};
