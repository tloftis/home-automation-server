exports.funct = function(value, userInput, data, callback){
    if(data.timer){
        return callback();
    }

    data.timer = setTimeout(function(){
        data.timer = false;
    }, userInput || 0);

    return callback(value);
};