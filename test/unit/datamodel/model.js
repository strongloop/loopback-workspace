// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../lib/datamodel/model');
const expect = require('../../helpers/expect');
const fs = require('fs-extra');
const Workspace = require('../../../lib/workspace');
const WorkspaceManager = require('../../../lib/workspace-manager');
const testSupport = require('../../helpers/test-support');

describe('Graph : Models', function() {
  before(createWorkspace);

  describe('constructor', function() {
    it('adds a new Model node to the graph', function() {
      const workspace = new Workspace('/');
      workspace.addDomain('ModelDefinition');
      const model = new Model(workspace, 'test', {}, {});
      expect(workspace.getNode('ModelDefinition', 'test')).to.eql(model);
    });
  });

  describe('create()', function() {
    it('creates the model definition file in the workspace', function(done) {
      const workspace = WorkspaceManager.getWorkspace();
      const data = {name: 'test', facetName: 'common'};
      const model =
        new Model(workspace, 'common.models.test', data);
      model.create(function(err) {
        if (err) return done(err);
        const file = model.getFilePath();
        fs.readJson(file, function(err, data) {
          if (err) return done(err);
          expect(Object.keys(data)).to.include.members(['facetName', 'name']);
          done();
        });
      });
    });
  });

  function createWorkspace(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  }
});
