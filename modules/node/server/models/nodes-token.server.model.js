'use strict';

/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeAPI Schema
let NodeTokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        trim: false,
        required: true
    },
    enabled: {
        type: Boolean,
        required: false,
        default: false
    },
    description: {
        type: String,
        trim: true,
        required: false,
        default: ''
    },
    name: {
        type: String,
        trim: false,
        required: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

NodeTokenSchema.pre('save', function (next) {
    if (!this.created) {
        this.created = new Date();
    }

    next();
});

//I use these hooks so that I don't have to do a database call in order verify a token
//The input events are far from real time, but I would like them to be a fast as piratically able without being too hacky
NodeTokenSchema.post('save', function () {
    let nodeComm = rootRequire('./modules/node/server/lib/node-communication.js');

    let add = nodeComm.tokens.some((token, index)=>{
        console.log(token._id,' === ',this._id);

       if(token._id+'' === this._id+''){
           nodeComm.tokens.splice(index, 1, this);
           return true;
       }
    });

    if(!add){
        nodeComm.tokens.push(this);
    }
});

NodeTokenSchema.post('remove', function () {
    let nodeComm = rootRequire('./modules/node/server/lib/node-communication.js');

    nodeComm.tokens.some((token, index)=>{
        console.log(token._id,' === ',this._id);

        if(token._id+'' === this._id+''){
            nodeComm.tokens.splice(index, 1);
            return true;
        }
    });
});

mongoose.model('NodeToken', NodeTokenSchema);
