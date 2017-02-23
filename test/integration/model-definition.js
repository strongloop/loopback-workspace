// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const app = require('../../');
const expect = require('../helpers/expect');
const testSupport = require('../helpers/test-support');
const ModelDefinition = app.models.ModelDefinition;

describe('ModelDefinition', function() {
  describe('CRUD', function() {
    beforeEach(function(done) {
      testSupport.givenBasicWorkspace('empty-server', done);
    });
    describe('models', function() {
      const test = this;
      it('create models', function(done) {
        test.model = {
          id: 'common.models.TestModel',
          facetName: 'common',
          name: 'TestModel',
          readonly: true,
          strict: true,
          public: true,
          idInjection: true,
        };
        ModelDefinition.create(test.model, function(err, modelDef) {
          if (err) return done(err);
          ModelDefinition.find(function(err, models) {
            if (err) return done(err);
            models = models.filter(function(model) {
              return model.id && (model.id === test.model.id);
            });
            test.modelDef = models && models.length && models[0];
            expect(test.modelDef).not.to.be.undefined();
            test.data = test.modelDef.toObject();
            expect(Object.keys(test.data)).to.include.members([
              'id',
              'facetName',
              'name',
              'readonly',
              'description',
              'plural',
              'base',
              'strict',
              'public',
              'idInjection',
            ]);
            done();
          });
        });
      });
      it('create properties', function(done) {
        const propertyDef = {
          modelId: test.model.id,
          name: 'property1',
          type: 'string',
        };
        test.modelDef.properties.create(propertyDef, {}, function(err, data) {
          if (err) return done(err);
          expect(Object.keys(data.toObject())).to.include.members([
            'modelId',
            'type',
            'name',
          ]);
          done();
        });
      });
    });
  });
});
