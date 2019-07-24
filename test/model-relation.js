// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs-extra');
const path = require('path');
const app = require('../');
const ModelRelation = app.models.ModelRelation;
const TestDataBuilder = require('./helpers/test-data-builder');
const expect = require('chai').expect;
const support = require('./support');
const SANDBOX = support.SANDBOX;
const givenBasicWorkspace = support.givenBasicWorkspace;

describe('ModelRelation', function() {
  beforeEach(givenBasicWorkspace);

  describe('ModelRelation.getValidTypes(callback)', function() {
    it('Get an array of valid types.');
  });

  it('can be created via the scope on ModelDefinition', function(done) {
    const test = this;
    new TestDataBuilder()
      .define('modelDef', app.models.ModelDefinition, {
        name: 'TestModel',
        facetName: 'common',
      })
      .buildTo(test, function(err) {
        if (err) return done(err);
        const modelDef = test.modelDef;
        modelDef.relations.create({
          name: 'boss',
          type: 'belongsTo',
          model: modelDef.name,
          foreignKey: 'reportsTo',
        }, function(err) {
          if (err) return done(err);
          const json = fs.readJsonSync(
            // eslint-disable-next-line no-undef
            path.resolve(SANDBOX, 'common/models/test-model.json')
          );
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
