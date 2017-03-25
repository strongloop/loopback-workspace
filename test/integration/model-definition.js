// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const app = require('../../');
const expect = require('../helpers/expect');
const testSupport = require('../helpers/test-support');
const ModelDefinition = app.models.ModelDefinition;
const fs = require('fs-extra');

describe('ModelDefinition', function() {
  describe('CRUD', function() {
    let model, modelDef, file, workspace;

    before(function(done) {
      testSupport.givenBasicWorkspace('empty-server', done);
      const WorkspaceManager = require('../../lib/workspace-manager');
      workspace = WorkspaceManager.getWorkspace();
    });

    it('model.create()', function(done) {
      model = {
        id: 'common.models.TestModel',
        facetName: 'common',
        name: 'TestModel',
        readonly: true,
        strict: true,
        public: true,
        idInjection: true,
      };
      ModelDefinition.create(model, function(err, modelDef) {
        if (err) return done(err);
        const modelNode = workspace.model(model.id);
        file = modelNode.getFilePath();
        fs.exists(file, function(isExists) {
          expect(isExists).to.be.true();
          done();
        });
      });
    });

    it('model.find()', function(done) {
      ModelDefinition.find(function(err, models) {
        if (err) return done(err);
        models = models.filter(function(m) {
          return m.id && (model.id === m.id);
        });
        modelDef = models && models.length && models[0];
        expect(modelDef).not.to.be.undefined();
        const data = modelDef.toObject();
        expect(Object.keys(data)).to.include.members([
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

    it('model.properties.create()', function(done) {
      const propertyDef = {
        modelId: model.id,
        name: 'property1',
        type: 'string',
      };
      modelDef.properties.create(propertyDef, {}, function(err, data) {
        if (err) return done(err);
        expect(Object.keys(data.toObject())).to.include.members([
          'modelId',
          'type',
          'name',
        ]);
        done();
      });
    });

    it('model.destroy()', function(done) {
      const filter = {where: {id: model.id}};
      ModelDefinition.destroyAll(filter, function(err) {
        if (err) return done(err);
        fs.exists(file, function(isExists) {
          expect(isExists).to.be.false();
          done();
        });
      });
    });
  });
});
