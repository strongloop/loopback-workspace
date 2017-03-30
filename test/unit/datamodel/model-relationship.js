// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../lib/datamodel/model');
const ModelRelation = require('../../../lib/datamodel/model-relationship');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : ModelRelation', function() {
  let workspace, parent, child, relation;
  before(createWorkspace);
  before(createModels);

  describe('constructor', function() {
    it('creates a ModelRelation node', function() {
      relation = new ModelRelation(workspace, 'testRelation', {});
      expect('testRelation').to.eql(relation._name);
    });
    describe('connect()', function() {
      it('adds an Edge between two Nodes', function() {
        relation.connect(parent, child);
        const outgoingEdge = parent.getOutboundLink('Child');
        const incomingEdge = child.getInboundLink('Parent');
        expect(outgoingEdge).to.eql(incomingEdge);
        expect(incomingEdge.getOriginatingNode()).to.eql(parent);
      });
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
