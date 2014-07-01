module.exports = function mountRestApi(server) {
  var restApp = require('../../rest');
  var restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, restApp);
};
