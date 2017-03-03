// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const app = require('../../');
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const testSupport = require('../helpers/test-support');
const ModelRelation = app.models.ModelRelation;
const ModelDefinition = app.models.ModelDefinition;
const WorkspaceManager = require('../../lib/workspace-manager');

describe('ModelRelation', function() {
  let user, manager;
  before(createWorkspace);
  before(createUser);
  before(createManager);

  describe('model.create()', function() {
    it('creates relation via the scope on ModelDefinition', function(done) {
      user.relations.create({
        name: 'boss',
        type: 'belongsTo',
        model: manager.id,
        foreignKey: 'reportsTo',
      }, function(err) {
        if (err) return done(err);
        const workspace = WorkspaceManager.getWorkspace();
        const model = workspace.getModel(user.id);
        const file = model.getFilePath();
        fs.readJson(file, function(err, data) {
          if (err) return done(err);
          const relation = data &&
            data.relations &&
            data.relations['boss'];
          expect(relation).to.eql({
            type: 'belongsTo',
            name: 'boss',
            model: 'manager',
            foreignKey: 'reportsTo',
          });
          done();
        });
      });
    });
  });

  function createWorkspace(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  }

  function createUser(done) {
    ModelDefinition.create(
      {
        id: 'server.models.user',
        name: 'user',
        facetName: 'server',
      },
      function(err, modelDef) {
        if (err) return done(err);
        user = modelDef;
        done();
      });
  }

  function createManager(done) {
    ModelDefinition.create(
      {
        id: 'server.models.manager',
        name: 'manager',
        facetName: 'server',
      },
      function(err, modelDef) {
        if (err) return done(err);
        manager = modelDef;
        done();
      });
  }
});
