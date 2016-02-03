'use strict';

/**
 * Module dependencies.
 */
require('dotenv').load();
var app = require('./config/lib/app');
var server = app.start();
