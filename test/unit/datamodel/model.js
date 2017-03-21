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
  let workspace;
  before(createWorkspace);

  describe('constructor', function() {
    it('adds a new Model node to the graph', function() {
      workspace = new Workspace('/');
      workspace.addDomain('ModelDefinition');
      const model = new Model(workspace, 'test', {}, {});
      expect(workspace.getNode('ModelDefinition', 'test')).to.eql(model);
    });
  });

  describe('create()', function() {
    it('write model definition file in workspace', function(next) {
      workspace = WorkspaceManager.getWorkspace();
      const data = {name: 'test', facetName: 'common'};
      const model =
        new Model(workspace, 'common.models.test', data);
      model.create(function(err) {
        const file = model.getFilePath();
        fs.readJson(file, function(err, data) {
          if (err) return next(err);
          expect(Object.keys(data)).to.include.members(['facetName', 'name']);
          next();
        });
      });
    });
  });

  function createWorkspace(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  }
});
