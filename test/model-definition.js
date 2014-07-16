var app = require('../app');
var ModelDefinition = app.models.ModelDefinition;
var ModelAccessControl = app.models.ModelAccessControl;
var ModelProperty = app.models.ModelProperty;
var ModelRelation = app.models.ModelRelation;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var ref = TestDataBuilder.ref;
var ConfigFile = app.models.ConfigFile;

describe('ModelDefinition', function() {
  
  describe('CRUD', function () {
    beforeEach(givenBasicWorkspace);

    beforeEach(function(done) {
      var test = this;
      test.modelName = 'TestModel';
      test.model = {
        name: test.modelName,
        componentName: '.', // root app
      };
      ModelDefinition.create(test.model, function(err, modelDef) {
        if(err) return done(err);
        test.modelDef = modelDef;
        done();
      });
    });

    beforeEach(givenFile('modelsConfigFile', 'model-config.json'));
    beforeEach(givenFile('modelConfigFile', 'models/test-model.json'));

    beforeEach(findAllEntities);

    describe('ModelDefinition.create(modelDef, cb)', function () {
      it('should create a models/$name.json file', function (done) {
        this.modelConfigFile.exists(function(err, exists) {
          expect(exists).to.equal(true);
          done();
        });
      });
    });
  });

  describe('ModelDefinition.getPath(app, obj)', function () {
    it('should return the configFile path if it exists', function () {
      var configFilePath = 'foo/bar/bat/baz.json';
      var path = ModelDefinition.getPath('.', { name: 'MyModel',
        configFile: configFilePath });

      expect(path).to.equal(configFilePath);
    });
    it('should return construct configFile path', function () {
      var path = ModelDefinition.getPath('.', { name: 'MyModel' });
      expect(path).to.equal('models/my-model.json');
    });
  });

  describe('ModelDefinition.toFilename(modelName)', function () {
    given('Foo').expect('foo');
    given('FooBar').expect('foo-bar');
    given('fooBar').expect('foo-bar');
    given('FOOBAR').expect('foobar');
    given('FooBarBatBaz').expect('foo-bar-bat-baz');
    given('foo-bar').expect('foo-bar');
    given('foo-BAR').expect('foo-bar');

    function given(input) {
      return {expect: function(expected) {
        it('given ' + input + ' expect ' + expected, function() {
          expect(ModelDefinition.toFilename(input)).to.equal(expected);
        });
      }}
    }
  });

  describe('ModelDefinition.getConfigFromCache(cache, modelDef)', function() {
    beforeEach(givenEmptyWorkspace);

    before(function() {
      Object.defineProperty(this, 'cache', {
        get: function() {
          return app.dataSources.db.connector.cache;
        }
      });
    });

    it('includes `name` property', function(done) {
      new TestDataBuilder()
        .define('model', ModelDefinition, {
          name: 'test-model'
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
          componentName: '.'
        })
        .define('aclx', ModelAccessControl, {
          method: 'ALL',
          modelId: ref('model.id')
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
          name: 'test-model',
          custom: 'custom'
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
      before(function buildModelAndRelatedEntities(done) {
        new TestDataBuilder()
          .define('model', ModelDefinition, {
            componentName: this.emptyComponent,
            custom: true
          })
          .define('acl', ModelAccessControl, {
            property: 'ALL',
            modelId: ref('model.id'),
            componentName: undefined, // do not auto-generate a value
            custom: true
          })
          .define('property', ModelProperty, {
            modelId: ref('model.id'),
            componentName: undefined, // do not auto-generate a value
            name: 'id',
            isId: true,
            custom: true
          })
          .define('relation', ModelRelation, {
            modelId: ref('model.id'),
            componentName: undefined, // do not auto-generate a value
            name: 'self',
            type: 'belongsTo',
            model: ref('model.name'),
            custom: true
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
          'desc',
          'custom'
        ]);
      });

      it('is correct for relations', function() {
        expect(Object.keys(this.data.relations.self)).to.eql([
          'type',
          'model',
          'as',
          'foreignKey',
          'custom'
        ]);
      });

      it('is correct for acls', function() {
        expect(Object.keys(this.data.acls[0])).to.eql([
          'principalType',
          'principalId',
          'permission',
          'property',
          'route',
          'custom'
        ]);
      });
    });
  });
});
