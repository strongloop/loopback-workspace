module.exports = function mountLoopBackExplorer(server) {
  var explorer;
  try {
    explorer = require('loopback-explorer');
  } catch(err) {
    console.log(
      'Run `npm install loopback-explorer` to enable the LoopBack explorer'
    );
    return;
  }

  var restApp = require('../../rest');
  var restApiRoot = server.get('restApiRoot');

  var explorerApp = explorer(restApp, { basePath: restApiRoot });
  server.use('/explorer', explorerApp);
  server.once('started', function(baseUrl) {
    // express 4.x (loopback 2.x) uses `mountpath`
    // express 3.x (loopback 1.x) uses `route`
    var explorerPath = explorerApp.mountpath || explorerApp.route;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  });
};
