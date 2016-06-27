exports.funct = function(value, userInput, data, callback){
    if(data.timer){
        clearTimeout(data.timer);

        data.timer = setTimeout(function(){
            data.timer = false;
        }, userInput || 0);

        return callback();
    }else{
        data.timer = setTimeout(function(){
            data.timer = false;
        }, userInput || 0);

        return callback(value);
    }
};