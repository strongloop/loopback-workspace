// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../lib/datamodel/model');
const Method = require('../../../lib/datamodel/model-method');
const expect = require('../../helpers/expect');
const fs = require('fs-extra');
const Workspace = require('../../../lib/workspace');
const WorkspaceManager = require('../../../lib/workspace-manager');
const testSupport = require('../../helpers/test-support');

describe('Graph : ModelMethod', function() {
  before(createWorkspace);
  before(createModel);

  describe('constructor', function() {
    let model, method;
    it('adds a new Method node to the graph', function() {
      const workspace = new Workspace('/');
      workspace.addDomain('ModelMethod');
      model = new Model(workspace, 'test', {}, {});
      method = new Method(workspace, 'testmethod', {}, {});
      model.add(method);
      expect(model.modelmethod('testmethod')).to.eql(method);
    });

    it('is able to set the method in the model', function() {
      model.add(method);
      const methodArray = model.getMethodDefinitions();
      expect(methodArray).to.have.lengthOf(1);
    });
  });

  describe('create()', function() {
    it('creates a method config in the model definition file', function(done) {
      const workspace = WorkspaceManager.getWorkspace();
      const data = {accepts: [], returns: []};
      const modelId = 'common.models.test';
      const method =
        new Method(workspace, 'testmethod', data);
      method.create(modelId, function(err) {
        if (err) return done(err);
        const model = workspace.model(modelId);
        const file = model.getFilePath();
        fs.readJson(file, function(err, data) {
          if (err) return done(err);
          const expectedMethods = data.methods;
          expect(Object.keys(expectedMethods))
            .to.include.members(['testmethod']);
          done();
        });
      });
    });
  });

  function createWorkspace(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  }

  function createModel(done) {
    const workspace = WorkspaceManager.getWorkspace();
    const data = {name: 'test', facetName: 'common'};
    const model =
      new Model(workspace, 'common.models.test', data);
    model.create(done);
  }
});
