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

});
