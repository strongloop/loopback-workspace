var path = require('path');
var loopback = require('loopback');
var boot = require('loopback-boot');
var explorer = require('loopback-explorer');

var app = module.exports = loopback();

boot(app, __dirname);

// middleware
app.use(loopback.compress());

// mount the REST API and the API explorer
var restApp = require('../rest');
var restApiRoot = app.get('restApiRoot');
app.use(restApiRoot, restApp);

var explorerApp = explorer(restApp, { basePath: restApiRoot });
app.use('/explorer', explorerApp);
app.once('started', function(baseUrl) {
  console.log('Browse your REST API at %s%s', baseUrl, explorerApp.mountpath);
});

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    var host = app.get('host') || '0.0.0.0';
    var baseUrl = 'http://' + host + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('Web server listening at: %s', baseUrl);
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
