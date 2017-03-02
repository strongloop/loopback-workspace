// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../datamodel/model');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : Models', function() {
  let workspace;
  before(createWorkspace);

  describe('constructor', function() {
    it('adds a new Model node to the graph', function() {
      const model = new Model(workspace, 'test', {}, {});
      expect(workspace.getNode('ModelDefinition', 'test')).to.eql(model);
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
    workspace.addDomain('ModelDefinition');
  }
});
