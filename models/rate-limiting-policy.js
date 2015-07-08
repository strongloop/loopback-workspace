var app = require('../app');
var loopback = require('loopback');
var debug = require('debug')('workspace:policy:rate-limiting');

var RateLimiting = app.models.RateLimiting;

