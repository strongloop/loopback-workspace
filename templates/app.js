var loopback = require('loopback');
var path = require('path');
var app = module.exports = loopback();

// operational dependencies
try {
  require('strong-agent').profile();
  var control = require('strong-cluster-control');
  var clusterOptions = control.loadOptions();
} catch(e) {
  console.log('Could not load operational dependencies:');
  console.log(e);
}

// if configured as a cluster master, just start controller
if(clusterOptions.clustered && clusterOptions.isMaster) {
  return control.start(clusterOptions);
}

// express compatible middleware
app.use(loopback.favicon());
app.use(loopback.logger(app.get('env') || 'dev'));
app.use(loopback.bodyParser());
app.use(loopback.methodOverride());
app.use(app.router);
app.use(loopback.static(path.join(__dirname, 'public')));
app.use(loopback.rest());

// development only
if ('development' == app.get('env')) {
  app.use(loopback.errorHandler());
}

// configure the app
// read more: http://docs.strongloop.com/loopback#appbootoptions
app.boot();

// explorer
try {
  var explorer = require('loopback-explorer');
  app.use('/explorer', explorer(app));
  console.log('Browse your REST API at http://%s:%s', app.get('host'), app.get('port'));
} catch(e){
  console.log('Run `npm install loopback-explorer` to enable the LoopBack explorer');
}

// only start the server if this module
// is the main module...
if(require.main === module) {
  require('http').createServer(app).listen(app.get('port'), function(){
    console.log('LoopBack server listening @ http://%s:%s', app.get('host') || 'localhost', app.get('port'));
  });
}
