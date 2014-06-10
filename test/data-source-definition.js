var app = require('../app');
var DataSourceDefinition = app.models.DataSourceDefinition;
var AppDefinition = app.models.AppDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('DataSourceDefinition', function() {

 it('validates `name` uniqueness within the project only', function(done) {
  var ref = TestDataBuilder.ref;
  new TestDataBuilder()
    .define('app1', AppDefinition, {
      name: 'app1'
    })
    .define('app2', Project, {
      name: 'app2'
    })
    .define('app1datasource', Datasource, {
      name: 'dsname',
      app: ref('app1.id')
    })
    .define('project2datasource', Datasource, {
      name: ref('app1datasource.name'),
      app: ref('app2.id')
    })
    .buildTo({}, function(err) {
      if (err && err.name === 'ValidationError') {
        err.message += '\nDetails: ' +
          JSON.stringify(err.details.messages, null, 2);
      }
      // The test passes when no error was reported.
      done(err);
    });
  });

  describe('dataSourceDefinition.testConnection(callback)', function() {
    it('Test the datasource definition connection.', function(done) {

    });
  });

  describe('dataSourceDefinition.getSchema(name, callback)', function() {
    it('Get the schema for the given table / collection name.', function(done) {

    });
  });

  describe('dataSourceDefinition.discoverModelDefinitions(callback)', function() {
    it('Discover model definitions available from this data source.', function(done) {

    });
  });
});
