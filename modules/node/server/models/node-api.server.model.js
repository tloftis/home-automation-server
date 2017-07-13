'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeAPI Schema
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
        required: false
    },
    permissions: {
        type: [String],
        required: false,
        default: []
    },
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
