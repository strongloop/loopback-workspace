// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../lib/datamodel/model');
const ModelRelation = require('../../../lib/datamodel/model-relationship');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : ModelRelations', function() {
  let workspace, parent, child;
  before(createWorkspace);
  before(createModels);

  describe('constructor', function() {
    it('adds a ModelRelation node in the graph', function() {
      const relation = new ModelRelation(workspace,
        'testRelation', {}, parent, child, {});
      expect(workspace.getNode('ModelRelation', 'testRelation'))
        .to.eql(relation);
    });

    it('adds an Edge between two Nodes', function() {
      const outgoingEdge = parent.getOutboundLink('Child');
      const incomingEdge = child.getInboundLink('Parent');
      expect(outgoingEdge).to.eql(incomingEdge);
      expect(incomingEdge.getOriginatingNode()).to.eql(parent);
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
    workspace.addDomain('ModelDefinition');
    workspace.addDomain('ModelRelation');
  }

  function createModels() {
    parent = new Model(workspace, 'Parent', {}, {});
    child = new Model(workspace, 'Child', {}, {});
  }
});
