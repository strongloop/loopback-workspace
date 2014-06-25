var loopback = require('loopback');
var app = module.exports = loopback();

app.dataSource('db', {
  connector: loopback.Memory,
  defaultForType: 'db'
});

app.dataSource('email', {
  connector: loopback.Mail,
  defaultForType: 'mail'
});

app.boot(__dirname);

// server middleware
app.use(loopback.favicon());
app.use(loopback.logger('dev'));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(loopback.errorHandler());
}

// only start the server if this module
// is the main module...
if(require.main === module) {
  app.listen();
}
