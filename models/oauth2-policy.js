var app = require('../app');
var debug = require('debug')('workspace:policy:oauth2');

var AuthPolicy = app.models.AuthPolicy;

AuthPolicy.prototype.defineScope = function(scope, cb) {

};

