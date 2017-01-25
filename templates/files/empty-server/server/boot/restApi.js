'use strict';

module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  server.middleware('routes:after', restApiRoot, server.loopback.rest());
};
