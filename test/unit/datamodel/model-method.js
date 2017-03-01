// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../../datamodel/model');
const Method = require('../../../datamodel/model-method');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : ModelMethod', function() {
  let workspace, model, method;
  before(createWorkspace);
  before(createModel);

  describe('constructor', function() {
    it('adds a new Method node to the graph', function() {
      method = new Method(workspace, 'testmethod', {}, {});
      expect(workspace.getNode('ModelMethod', 'testmethod')).to.eql(method);
    });

    it('is able to set the method in the model', function() {
      model.setMethod(method);
      const methodArray = model.getMethodDefinitions();
      expect(methodArray).to.have.lengthOf(1);
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
    workspace.addDomain('ModelDefinition');
    workspace.addDomain('ModelMethod');
  }

  function createModel() {
    model = new Model(workspace, 'test', {}, {});
  }
});
