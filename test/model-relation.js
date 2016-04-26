// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs = require('fs-extra');
var path = require('path');
var app = require('../');
var ModelRelation = app.models.ModelRelation;
var TestDataBuilder = require('./helpers/test-data-builder');

describe('ModelRelation', function() {
  beforeEach(givenBasicWorkspace);

  describe('ModelRelation.getValidTypes(callback)', function() {
    it('Get an array of valid types.');
  });

  it('can be created via the scope on ModelDefinition', function(done) {
    var test = this;
    new TestDataBuilder()
      .define('modelDef', app.models.ModelDefinition, {
        name: 'TestModel',
        facetName: 'common',
      })
      .buildTo(test, function(err) {
        if (err) return done(err);
        var modelDef = test.modelDef;
        modelDef.relations.create({
          name: 'boss',
          type: 'belongsTo',
          model: modelDef.name,
          foreignKey: 'reportsTo',
        }, function(err) {
          if (err) return done(err);
          var json = fs.readJsonSync(
            path.resolve(SANDBOX, 'common/models/test-model.json'));
          expect(json.relations).to.eql({
            boss: {
              type: 'belongsTo',
              model: modelDef.name,
              foreignKey: 'reportsTo',
            },
          });
          done();
        });
      });
  });
});
