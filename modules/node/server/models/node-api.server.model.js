'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeLink Schema
var NodeAPISchema = new Schema({
    description: {
        type: String,
        trim: true,
        required: false,
        default: ''
    },
    name: {
        type: String,
        trim: false,
        required: true
    },
    token: {
        type: String,
        unique: true,
        trim: false,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

NodeAPISchema.pre('save', function (next) {
    var now = new Date();

    if (!this.created) {
        this.created = now;
    }

    next();
});

mongoose.model('NodeAPI', NodeAPISchema);
