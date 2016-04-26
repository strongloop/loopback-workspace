// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var util = require('util');
var async = require('async');
var app = require('../');
var loopback = require('loopback');
var DataSource = loopback.DataSource;
var ConfigFile = app.models.ConfigFile;
var DataSourceDefinition = app.models.DataSourceDefinition;
var Facet = app.models.Facet;
var TestDataBuilder = require('./helpers/test-data-builder');

describe('DataSourceDefinition', function() {
  describe('DataSourceDefinition.create(def, cb)', function() {
    beforeEach(givenEmptyWorkspace);
    beforeEach(function(done) {
      var serverFacet = this.serverFacet;
      this.configFile = new ConfigFile({
        path: serverFacet + '/datasources.json',
      });
      async.parallel([function(cb) {
        DataSourceDefinition.create({
          facetName: serverFacet,
          name: 'foo',
          connector: 'memory',
        }, cb);
      }, function(cb) {
        DataSourceDefinition.create({
          facetName: serverFacet,
          name: 'bar',
          connector: 'memory',
        }, cb);
      }], done);
    });
    beforeEach(function(done) {
      this.configFile.load(done);
    });
    it('should be able to create multiple', function(done) {
      DataSourceDefinition.find(function(err, defs) {
        expect(defs).to.have.length(2);
        done();
      });
    });
    describe('config file', function() {
      it('should be created', function(done) {
        this.configFile.exists(function(err, exists) {
          expect(err).to.not.exist;
          expect(exists).to.equal(true);
          done();
        });
      });
      it('should not contain id properties', function() {
        var configData = this.configFile.data;
        var dsConfig = configData.foo;
        expect(dsConfig).to.not.have.property('id');
        expect(dsConfig).to.not.have.property('facetName');
      });
    });
    it('should be persist multiple to the config file', function(done) {
      var defs = Object.keys(this.configFile.data).sort();
      expect(defs).to.eql(['bar', 'foo'].sort());
      done();
    });

    it('should not contain workspace-private properties', function(done) {
      // This test is reproducing an issue discovered in generator-loopback
      var configFile = this.configFile;
      DataSourceDefinition.create({
        name: 'another-ds',
        connector: 'rest',
        facetName: this.serverFacet,
      }, function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) done(err);
          var datasources = configFile.data;
          expect(Object.keys(datasources.foo)).to.not.contain('configFile');
          done();
        });
      });
    });
  });
  it('validates `name` uniqueness within the facet only', function(done) {
    var ref = TestDataBuilder.ref;
    new TestDataBuilder()
      .define('facet1', Facet, {
        name: 'facet1',
      })
      .define('facet2', Facet, {
        name: 'facet2',
      })
      .define('facet1datasource', DataSourceDefinition, {
        name: 'dsname',
        facetName: ref('facet1.name'),
        connector: 'foo',
      })
      .define('facet2datasource', DataSourceDefinition, {
        name: ref('facet1datasource.name'),
        facetName: ref('facet2.name'),
        connector: 'foo',
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

  describe('dataSourceDefinition.configFile', function() {
    beforeEach(givenBasicWorkspace);
    beforeEach(findDataSourceDefinitions);

    it('should be defined', function() {
      this.dataSources.forEach(function(def) {
        expect(def.configFile).to.equal('server/datasources.json');
      });
    });
  });

  describe('dataSourceDefinition.toDataSource()', function() {
    it('should get an actual dataSource object', function() {
      var dataSourceDef = new DataSourceDefinition({
        connector: 'memory',
        name: 'db',
      });
      expect(dataSourceDef.toDataSource()).to.be.an.instanceof(DataSource);
    });
  });

  describe('DataSourceDefinition.testConnection(data, callback)', function() {
    it('returns true for memory connector', function(done) {
      DataSourceDefinition.testConnection(
        {
          connector: 'memory',
          name: 'test-memory-ds',
        },
        function(err, connectionAvailable) {
          if (err) return done(err);
          expect(connectionAvailable).to.be.true;
          done();
        }
      );
    });

    it('returns error for unknown connector', function(done) {
      DataSourceDefinition.testConnection(
        {
          connector: 'connector-that-does-not-exist',
          name: 'test-unknown-ds',
        },
        function(err, connectionAvailable) {
          expect(err, 'err').to.be.defined;
          done();
        }
      );
    });
  });

  describe('dataSourceDefinition.createModel(modelDefinition, cb)', function() {
    beforeEach(givenBasicWorkspace);
    beforeEach(function(done) {
      var test = this;
      DataSourceDefinition.create({
        name: 'basic',
        connector: 'memory',
        facetName: 'server',
      }, function(err, def) {
        if (err) return done(err);
        test.basic = def;
        done();
      });
    });
    beforeEach(function(done) {
      this.basic.createModel({
        name: 'BasicModel',
        properties: {
          id: {
            type: 'number',
            // NOTE: the discovery data uses `id` as the property name,
            // but the workspace API uses `isId` as the property name instead
            id: true,
          },
          name: { type: 'string' },
        },
        options: {
          foo: 'bar',
        },
      }, done);
    });
    it('should create a model definition', function(done) {
      app.models.ModelDefinition.findOne({
        where: {
          name: 'BasicModel',
        },
      }, function(err, modelDefinition) {
        expect(err).to.not.exist();
        expect(modelDefinition).to.exist();
        expect(modelDefinition.name).to.equal('BasicModel');
        expect(modelDefinition.facetName).to.equal('common');
        modelDefinition.properties(
          { where: { name: 'id' }},
          function(err, list) {
            if (err) return done(err);
            expect(list).to.have.length(1);
            var idProp = list[0];
            expect(idProp.isId).to.be.true();
            done();
          });
      });
    });

    it('should create a model config', function(done) {
      var test = this;
      app.models.ModelConfig.findOne({
        where: {
          name: 'BasicModel',
        },
      }, function(err, config) {
        expect(err).to.not.exist;
        expect(config.toObject().dataSource).to.equal(test.basic.name);
        done();
      });
    });
  });
});

function getMockDataSourceDef() {
  var def = new DataSourceDefinition({
    connector: 'memory',
    name: 'db',
  });

  var dataSource = def.toDataSource();

  var mockDataSource = {
    connector: {
      connect: function(cb) {
        process.nextTick(cb);
      },
    },
    discoverModelDefinitions: function(options, cb) {
      cb(null,
        [
          { type: 'table', name: 'customer', schema: 'strongloop' },
          { type: 'table', name: 'inventory', owner: 'strongloop' },
          { type: 'table', name: 'location', schema: 'strongloop' },
          { type: 'table', name: 'session', owner: 'strongloop' },
          { type: 'view', name: 'INVENTORY_VIEW', owner: 'STRONGLOOP' },
        ]
      );
    },
    discoverSchemas: function(modelName, options, cb) {
      cb(null, {
        'Customer': {
          'options': {
            'idInjection': false,
            'oracle': {
              'schema': 'BLACKPOOL',
              'table': 'PRODUCT',
            },
            'relations': {
              // TODO(ritch) add relations
            },
          },
          'properties': {
            'id': {
              'type': 'String',
              'required': true,
              'length': 20,
              'id': 1,
              'oracle': {
                'columnName': 'ID',
                'dataType': 'VARCHAR2',
                'dataLength': 20,
                'nullable': 'N',
              },
            },
            'name': {
              'type': 'String',
              'required': false,
              'length': 64,
              'oracle': {
                'columnName': 'NAME',
                'dataType': 'VARCHAR2',
                'dataLength': 64,
                'nullable': 'Y',
              },
            },
          },
        },
      });
    },
  };

  def.toDataSource = function() {
    return util._extend(dataSource, mockDataSource);
  };

  return def;
}
