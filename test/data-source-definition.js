var app = require('../app');
var DataSourceDefinition = app.models.DataSourceDefinition;
var ComponentDefinition = app.models.ComponentDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('DataSourceDefinition', function() {

 it('validates `name` uniqueness within the component only', function(done) {
  var ref = TestDataBuilder.ref;
  new TestDataBuilder()
    .define('component1', ComponentDefinition, {
      name: 'component1'
    })
    .define('component2', ComponentDefinition, {
      name: 'component2'
    })
    .define('component1datasource', DataSourceDefinition, {
      name: 'dsname',
      componentName: ref('component1.name'),
      connector: 'foo'
    })
    .define('component2datasource', DataSourceDefinition, {
      name: ref('component1datasource.name'),
      componentName: ref('component2.name'),
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
    beforeEach(givenBasicWorkspace);
    beforeEach(findDataSourceDefinitions);

    it('should be defined', function () {
      this.dataSources.forEach(function(def) {
        expect(def.configFile).to.equal('rest/datasources.json');
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
