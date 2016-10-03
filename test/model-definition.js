// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../');
var fs = require('fs');
var given = require('./helpers/given');
var ModelDefinition = app.models.ModelDefinition;
var ModelAccessControl = app.models.ModelAccessControl;
var ModelProperty = app.models.ModelProperty;
var ModelRelation = app.models.ModelRelation;
var TestDataBuilder = require('./helpers/test-data-builder');
var ref = TestDataBuilder.ref;
var ConfigFile = app.models.ConfigFile;
var path = require('path');

describe('ModelDefinition', function() {
  describe('CRUD', function() {
    beforeEach(givenBasicWorkspace);

    beforeEach(function(done) {
      var test = this;
      test.modelName = 'TestModel';
      test.model = {
        name: test.modelName,
        facetName: 'common',
      };
      ModelDefinition.create(test.model, function(err, modelDef) {
        if (err) return done(err);
        test.modelDef = modelDef;
        done();
      });
    });

    beforeEach(givenFile('modelsConfigFile', 'common/model-config.json'));
    beforeEach(givenFile('modelDefFile', 'common/models/test-model.json'));

    beforeEach(findAllEntities);

    describe('ModelDefinition.create(modelDef, cb)', function() {
      it('should create a common/models/$name.json file', function(done) {
        this.modelDefFile.exists(function(err, exists) {
          expect(exists).to.equal(true);
          done();
        });
      });
      it('should create common/models/$name.js file', function(done) {
        var script = this.modelDef.getScriptPath();
        fs.exists(script, function(exists) {
          expect(exists).to.equal(true);
          done();
        });
      });

      it('should set `idInjection` to true by default', function() {
        expect(this.modelDef.idInjection).to.equal(true);
      });
    });

    describe('ModelDefinition.removeById(id, cb)', function() {
      beforeEach(function(done) {
        this.modelDef.properties.create({
          name: 'myProp',
        }, done);
      });
      it('should remove the model definition', function(done) {
        var id = this.modelDef.id;
        ModelDefinition.removeById(id, function(err) {
          if (err) return done(err);
          ModelDefinition.findById(id, function(err, modelDef) {
            if (err) return done(err);
            expect(modelDef).to.not.exist;
            ModelProperty.count(function(err, count) {
              if (err) return done(err);
              expect(count).to.equal(0);
              done();
            });
          });
        });
      });

      it('should delete the model def js file', function(done) {
        var id = this.modelDef.id;
        var self = this;
        ModelDefinition.removeById(id, function(err) {
          if (err) return done(err);

          var script = self.modelDef.getScriptPath();
          fs.exists(script, function(exists) {
            expect(exists).to.equal(false);
            done();
          });
        });
      });
    });
  });

  describe('loader', function() {
    beforeEach(givenBasicWorkspace);

    it('discovers LoopBack built-in models', function(done) {
      given.loopBackInSandboxModules();
      ModelDefinition.find(function(err, list) {
        if (err) return done(err);
        var entries = list.map(function(modelDef) {
          return modelDef.name + (modelDef.readonly ? ' (RO)' : '');
        });

        expect(entries).to.include.members([
          'Application (RO)',
          'Email (RO)',
          'User (RO)',
        ]);
        done();
      });
    });
  });

  describe('ModelDefinition.getPath(app, obj)', function() {
    it('should return the configFile path if it exists', function() {
      var configFilePath = 'foo/bar/bat/baz.json';
      var modelPath = ModelDefinition.getPath('.', { name: 'MyModel',
        configFile: configFilePath });

      expect(modelPath).to.equal(configFilePath);
    });
    it('should return construct configFile path', function() {
      var configFilePath = 'models/my-model.json';
      var modelPath = ModelDefinition.getPath('.', { name: 'MyModel' });
      expect(modelPath).to.equal(path.normalize(configFilePath));
    });
  });

  describe('validation', function() {
    before(givenBasicWorkspace);

    it('rejects invalid model name', function(done) {
      var md = new ModelDefinition({
        facetName: 'server',
        name: 'a name with space',
      });

      md.isValid(function(valid) {
        expect(valid, 'isValid').to.be.false;
        expect(md.errors).to.have.property('name');
        expect(md.errors.name).to.eql(['is invalid']);
        done();
      });
    });
  });

  describe('ModelDefinition.toFilename(modelName)', function() {
    given('Foo').expect('foo');
    given('FooBar').expect('foo-bar');
    given('fooBar').expect('foo-bar');
    given('FOOBAR').expect('foobar');
    given('FooBarBatBaz').expect('foo-bar-bat-baz');
    given('foo-bar').expect('foo-bar');
    given('foo-BAR').expect('foo-bar');

    function given(input) {
      return { expect: function(expected) {
        it('given ' + input + ' expect ' + expected, function() {
          expect(ModelDefinition.toFilename(input)).to.equal(expected);
        });
      } };
    }
  });

  describe('ModelDefinition.getConfigFromCache(cache, modelDef)', function() {
    beforeEach(givenEmptyWorkspace);

    before(function() {
      Object.defineProperty(this, 'cache', {
        get: function() {
          return app.dataSources.db.connector.cache;
        },
      });
    });

    it('includes `name` property', function(done) {
      new TestDataBuilder()
        .define('model', ModelDefinition, {
          facetName: 'server',
          name: 'test-model',
        })
        .buildTo(this, function(err) {
          if (err) return done(err);
          var modelDef = this.model.toObject();
          var data = ModelDefinition.getConfigFromCache(this.cache, modelDef);
          expect(data).to.have.property('name', 'test-model');
          done();
        }.bind(this));
    });

    it('includes access-control configuration', function(done) {
      new TestDataBuilder()
        .define('model', ModelDefinition, {
          name: 'Car',
          facetName: 'common',
        })
        .define('aclx', ModelAccessControl, {
          facetName: undefined, // prevent data builder from filling this
          method: 'ALL',
          modelId: ref('model.id'),
        })
        .buildTo(this, function(err) {
          if (err) return done(err);
          var modelDef = this.model.toObject();
          var data = ModelDefinition.getConfigFromCache(this.cache, modelDef);
          expect(data).to.have.property('acls');
          expect(data.acls, 'acls').to.have.length(1);
          expect(data.acls[0], 'acls[0]').to.have.property('method', 'ALL');
          done();
        }.bind(this));
    });

    it('includes all custom properties', function(done) {
      new TestDataBuilder()
        .define('model', ModelDefinition, {
          facetName: 'server',
          name: 'test-model',
          custom: 'custom',
        })
        .buildTo(this, function(err) {
          if (err) return done(err);
          var modelDef = this.model.toObject();
          var data = ModelDefinition.getConfigFromCache(this.cache, modelDef);
          expect(data).to.have.property('custom', 'custom');
          done();
        }.bind(this));
    });

    describe('order of keys', function() {
      before(givenBasicWorkspace);
      before(function buildModelAndRelatedEntities(done) {
        new TestDataBuilder()
          .define('model', ModelDefinition, {
            facetName: 'server',
            name: 'a-name',
            custom: true,
          })
          .define('acl', ModelAccessControl, {
            property: 'ALL',
            modelId: ref('model.id'),
            facetName: undefined, // do not auto-generate a value
            custom: true,
          })
          .define('property', ModelProperty, {
            modelId: ref('model.id'),
            facetName: undefined, // do not auto-generate a value
            name: 'id',
            type: 'string',
            isId: true,
            custom: true,
          })
          .define('property', ModelProperty, {
            modelId: ref('model.id'),
            facetName: 'server', // do not auto-generate a value
            name: 'xyz',
            disableInherit: true,
            custom: true,
          })
          .define('relation', ModelRelation, {
            modelId: ref('model.id'),
            facetName: undefined, // do not auto-generate a value
            name: 'self',
            type: 'belongsTo',
            model: ref('model.name'),
            custom: true,
          })
          .buildTo(this, function(err) {
            if (err) return done(err);
            var modelDef = this.model.toObject();
            this.data = ModelDefinition.getConfigFromCache(this.cache, modelDef);
            done();
          }.bind(this));
      });

      it('is correct for models', function() {
        expect(Object.keys(this.data)).to.eql([
          'name',
          'description',
          'plural',
          'base',
          'strict',
          'public',
          'idInjection',
          'scopes',
          'indexes',
          'options',
          'custom',
          'properties',
          'validations',
          'relations',
          'acls',
          'methods',
        ]);
      });

      it('is correct for properties', function() {
        expect(Object.keys(this.data.properties.id)).to.eql([
          'type',
          'id',
          'generated',
          'required',
          'index',
          'description',
          'custom',
        ]);
      });

      it('is correct for properties to disable inherit', function() {
        expect(this.data.properties.xyz).to.eql(false);
      });

      it('is correct for relations', function() {
        expect(Object.keys(this.data.relations.self)).to.eql([
          'type',
          'model',
          'as',
          'foreignKey',
          'custom',
        ]);
      });

      it('is correct for acls', function() {
        expect(Object.keys(this.data.acls[0])).to.eql([
          'accessType',
          'principalType',
          'principalId',
          'permission',
          'property',
          'custom',
        ]);
      });
    });
  });
});
