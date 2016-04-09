'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodeLink Schema
var NodeLinkSchema = new Schema({
    output: {
        nodeId: {
            type: String,
            trim: false
        },
        pin: {
            type: String,
            trim: false
        }
    },
    input: {
        nodeId: {
            type: String,
            trim: false
        },
        pin: {
            type: String,
            trim: false
        }
    },
    connectionType: { //0: On Fall, 1: On Rise, 2: On Both
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('NodeLink', NodeLinkSchema);
