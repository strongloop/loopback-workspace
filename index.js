var loopback = require('loopback');
var app = module.exports = loopback();
var DEFAULT_DATASOURCE = 'db';

app.dataSource('db', {
  connector: loopback.Memory
});

var Project = app.model('project', {dataSource: DEFAULT_DATASOURCE});
var ModelDef = app.model('model-definition', {dataSource: DEFAULT_DATASOURCE, properties: {
  dataSource: String,
  public: Boolean,
  options: Object
}});
var DataSourceDef = app.model('datasource-definition', {dataSource: DEFAULT_DATASOURCE, properties: {
  defaultForType: String,
  connector: String
}});
var AppDef = app.model('app-definition', {dataSource: DEFAULT_DATASOURCE});

// relationships
Project.hasMany('models', {model: ModelDef});
Project.hasMany('dataSources', {model: DataSourceDef});

// model extensions
require('./models/project');
require('./models/model-definition');
require('./models/datasource-definition');

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
