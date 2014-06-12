var app = require('../app');
var DataSourceDefinition = app.models.DataSourceDefinition;
var AppDefinition = app.models.AppDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('DataSourceDefinition', function() {

 it('validates `name` uniqueness within the app only', function(done) {
  var ref = TestDataBuilder.ref;
  new TestDataBuilder()
    .define('app1', AppDefinition, {
      name: 'app1'
    })
    .define('app2', AppDefinition, {
      name: 'app2'
    })
    .define('app1datasource', DataSourceDefinition, {
      name: 'dsname',
      appName: ref('app1.name'),
      connector: 'foo'
    })
    .define('app2datasource', DataSourceDefinition, {
      name: ref('app1datasource.name'),
      appName: ref('app2.name'),
      connector: 'foo'
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

  describe('dataSourceDefinition.configFile', function () {
    beforeEach(givenEmptyWorkspace);
    beforeEach(findDataSourceDefinitions);

    it('should be defined', function () {
      this.dataSources.forEach(function(def) {
        expect(def.configFile).to.equal('api/datasource.json');
      });
    });
  });

  describe.skip('dataSourceDefinition.testConnection(callback)', function() {
    it('Test the datasource definition connection.', function(done) {

    });
  });

  describe.skip('dataSourceDefinition.getSchema(name, callback)', function() {
    it('Get the schema for the given table / collection name.', function(done) {

    });
  });

  describe.skip('dataSourceDefinition.automigrate(callback)', function() {
    it('should call dataSource.automigrate()', function(done) {

    });
  });


  describe.skip('dataSourceDefinition.autoupdate(callback)', function() {
    it('should call dataSource.autoupdate()', function(done) {

    });
  });
});
