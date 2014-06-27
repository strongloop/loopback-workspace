var async = require('async');
var app = require('../app');
var ConfigFile = app.models.ConfigFile;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ComponentDefinition = app.models.ComponentDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('DataSourceDefinition', function() {

  describe('DataSourceDefinition.create(def, cb)', function () {
    beforeEach(givenEmptyWorkspace);
    beforeEach(function(done) {
      this.configFile = new ConfigFile({
        path: 'datasources.json'
      });
      async.parallel([function(cb) {
        DataSourceDefinition.create({
          componentName: '.',
          name: 'foo',
          connector: 'memory'
        }, cb);
      }, function(cb) {
        DataSourceDefinition.create({
          componentName: '.',
          name: 'bar',
          connector: 'memory'
        }, cb);
      }], done);
    });
    beforeEach(function(done) {
      this.configFile.load(done);
    });
    it('shoulb be able to create multiple', function (done) {
      DataSourceDefinition.find(function(err, defs) {
        expect(defs).to.have.length(2);
        done();
      });
    });
    it('should create a config file', function(done) {
      this.configFile.exists(function(err, exists) {
        expect(err).to.not.exist;
        expect(exists).to.equal(true);
        done();
      });
    });
    it('shoulb be persist multiple to the config file', function (done) {
      var defs = Object.keys(this.configFile.data).sort();
      expect(defs).to.eql(['bar', 'foo'].sort());
      done();
    });
  });

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
