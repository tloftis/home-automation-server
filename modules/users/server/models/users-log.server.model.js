'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserLogSchema = new Schema({
    msg: {
        type: String,
        trim: true
    },
    data: {},
    username: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now,
        expires: 2592000 //defaults to 30 days
    },
    type: {
        type: String,
        required: true,
        trim: true,
        enum: ['remove', 'update', 'create', 'other']
    }
});

mongoose.model('UsersLog', UserLogSchema, 'users-log');
