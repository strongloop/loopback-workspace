var loopback = require('loopback');
var path = require('path');
var app = module.exports = loopback();

// operational dependencies
require('strong-agent').profile();
var control = require('strong-cluster-control');
var clusterOptions = control.loadOptions();

// if configured as a cluster master, just start controller
if(clusterOptions.clustered && clusterOptions.isMaster) {
  return control.start(clusterOptions);
}

// express compatible middleware
app.use(loopback.favicon());
app.use(loopback.logger('dev'));
app.use(loopback.bodyParser());
app.use(loopback.methodOverride());
app.use(app.router);
app.use(loopback.static(path.join(__dirname, 'public')));
app.use(loopback.rest());

// configure the app
// read more: http://docs.strongloop.com/loopback#appbootoptions
app.boot();

// development only
if ('development' == app.get('env')) {
  app.use(loopback.errorHandler());
}

// only start the server if this module
// is the main module...
if(require.main === module) {
  require('http').createServer(app).listen(app.get('port'), function(){
    console.log('LoopBack server listening on port ' + app.get('port'));
  });
}
