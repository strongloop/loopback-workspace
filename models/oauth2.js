var app = require('../app');
var loopback = require('loopback');
var debug = require('debug')('workspace:policy:oauth2');

var Middleware = app.models.Middleware;
var OAuth2 = app.models.OAuth2;

OAuth2.prototype.defineScope = function(scope, cb) {

};

