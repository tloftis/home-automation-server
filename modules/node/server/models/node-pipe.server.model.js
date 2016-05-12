'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// NodePipe Schema, this will store random data that node pipes may have
var NodePipeSchema = new Schema({
    pipeId: {
        type: String,
        required: true,
        trim: false
    },
    data: {},
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('NodePipe', NodePipeSchema);
