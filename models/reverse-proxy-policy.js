var app = require('../app');
var loopback = require('loopback');
var debug = require('debug')('workspace:policy:reverse-proxy');

var Middleware = app.models.Middleware;
var ReverseProxyPolicy = app.models.ReverseProxyPolicy;

ReverseProxyPolicy.prototype.addMapping = function(mapping, cb) {
  this.params.routes = this.params.routes || [];
  if(typeof mapping === 'string') {

  } else if(typeof mapping === 'object') {

  } else {

  }
};

