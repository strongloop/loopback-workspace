var util = require('util');
var async = require('async');
var app = require('../app');
var loopback = require('loopback');
var DataSource = loopback.DataSource;
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

  describe('dataSourceDefinition.toDataSource()', function () {
    it('should get an actual dataSource object', function () {
      var dataSourceDef = new DataSourceDefinition({
        connector: 'memory',
        name: 'db'
      });
      expect(dataSourceDef.toDataSource()).to.be.an.instanceof(DataSource);
    });
  });

  describe('dataSourceDefinition.testConnection(callback)', function() {
    it('Test the datasource definition connection.', function(done) {
      var dataSourceDef = getMockDataSourceDef();

      dataSourceDef.testConnection(function(err, connectionAvailable) {
        expect(err).to.not.exist;
        expect(connectionAvailable).to.be.true;
        done();
      });
    });
  });

  describe('dataSourceDefinition.getSchema(callback)', function() {
    it('Test the datasource definition connection.', function(done) {
      var dataSourceDef = getMockDataSourceDef();

      dataSourceDef.getSchema({}, function(err, schema) {
        expect(err).to.not.exist;
        expect(schema).to.be.instanceof(Array);
        done();
      });
    });
  });

  describe('dataSourceDefinition.discoverModelDefinition(name, callback)', function() {
    it('Test the datasource definition connection.', function(done) {
      var dataSourceDef = getMockDataSourceDef();

      dataSourceDef.getSchema({}, function(err, schema) {
        expect(err).to.not.exist;
        dataSourceDef.discoverModelDefinition(schema[0].name, {}, function(err, schema) {
          expect(err).to.not.exist;
          expect(schema.Customer).to.exist;
          done();
        });
      });
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

function getMockDataSourceDef() {
  var def = new DataSourceDefinition({
    connector: 'memory',
    name: 'db'
  });

  var dataSource = def.toDataSource();

  var mockDataSource = {
    connector: {
      connect: function(cb) {
        process.nextTick(cb);
      }
    },
    discoverModelDefinitions: function(options, cb) {
      cb(null,
        [
          { type: 'table', name: 'customer', schema: 'strongloop' },
          { type: 'table', name: 'inventory', owner: 'strongloop' },
          { type: 'table', name: 'location', schema: 'strongloop' },
          { type: 'table', name: 'session', owner: 'strongloop' },
          { type: 'view', name: 'INVENTORY_VIEW', owner: 'STRONGLOOP' }
        ]
      );
    },
    discoverSchemas: function(modelName, options, cb) {
      cb(null, {
        "Customer": {
          "options": {
            "idInjection": false,
            "oracle": {
              "schema": "BLACKPOOL",
              "table": "PRODUCT"
            },
            "relations": {
              // TODO(ritch) add relations
            }
          },
          "properties": {
            "id": {
              "type": "String",
              "required": true,
              "length": 20,
              "id": 1,
              "oracle": {
                "columnName": "ID",
                "dataType": "VARCHAR2",
                "dataLength": 20,
                "nullable": "N"
              }
            },
            "name": {
              "type": "String",
              "required": false,
              "length": 64,
              "oracle": {
                "columnName": "NAME",
                "dataType": "VARCHAR2",
                "dataLength": 64,
                "nullable": "Y"
              }
            }
          }
        }
      });
    }
  };

  def.toDataSource = function() {
    return util._extend(dataSource, mockDataSource);
  }

  return def;
}
