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
        required: false,
        default: ''
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
    pipes: [{
        data: {
            trim: false,
            required: false
        },
        pipeId:{
            type: String,
            trim: false,
            required: true
        }
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('NodeLink', NodeLinkSchema);
