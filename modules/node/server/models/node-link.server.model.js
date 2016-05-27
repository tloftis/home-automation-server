'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeLink Schema
var NodeLinkSchema = new Schema({
    description: {
        type: String,
        trim: true,
        required: false
    },
    inputId: {
        type: String,
        trim: false,
        required: true
    },
    outputId: {
        type: String,
        trim: false,
        required: true
    },
    pipes: [
        {
            type: String,
            trim: false
        }
    ],
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('NodeLink', NodeLinkSchema);
