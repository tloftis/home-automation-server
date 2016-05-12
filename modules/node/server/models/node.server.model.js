'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeLink Schema
var NodeLinkSchema = new Schema({
    input: {
        nodeId: {
            type: String,
            trim: false,
            required: true
        }
    },
    output: {
        nodeId: {
            type: String,
            trim: false,
            required: true
        }
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
