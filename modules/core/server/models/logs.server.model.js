'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// log Schema
var logSchema = new Schema({
    message: {
        type: String,
        trim: true,
        required: false,
        default: ''
    },
    type: {
        type: String,
        required: false
    },
    data: {},
    source: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

logSchema.pre('save', function (next) {
    var now = new Date();

    if (!this.created) {
        this.created = now;
    }

    next();
});

mongoose.model('Logs', logSchema);
