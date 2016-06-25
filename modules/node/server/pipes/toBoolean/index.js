exports.funct = function(value, userInput, data, callback){
    var out;

    if(value === 'true'){ out = true; }
    else if(value === 'false'){ out = false; }
    else{ out = value ? true : false }

    return callback(out);
};
