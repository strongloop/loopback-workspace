var app = require('../app');
var ModelDefinition = app.models.ModelDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var ConfigFile = app.models.ConfigFile;

describe('ModelDefinition', function() {
  
  describe('CRUD', function () {
    beforeEach(givenBasicWorkspace);

    beforeEach(function(done) {
      var test = this;
      test.modelName = 'TestModel';
      test.dataSourceName = 'test datasource';
      test.model = {
        name: test.modelName,
        componentName: '.', // root app
        dataSource: test.dataSourceName
      };
      ModelDefinition.create(test.model, function(err, modelDef) {
        if(err) return done(err);
        test.modelDef = modelDef;
        done();
      });
    });

    beforeEach(givenFile('modelsConfigFile', 'models.json'));
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
});
