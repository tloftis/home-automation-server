'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// NodeAPI Schema
var NodeServerTokenSchema = new Schema({
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

NodeServerTokenSchema.pre('save', function (next) {
  if (!this.created) {
    this.created = new Date();
  }

  next();
});

mongoose.model('NodeServerToken', NodeServerTokenSchema);
