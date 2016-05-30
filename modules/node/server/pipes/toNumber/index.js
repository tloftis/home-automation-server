exports.funct = function(value, userInput){
    var out = +value;

    if(isNaN(out)){
        out = 0;
    }

    return out;
};
