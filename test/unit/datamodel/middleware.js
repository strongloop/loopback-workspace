// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Middleware = require('../../../datamodel/middleware');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : Middleware', function() {
  let workspace;
  before(createWorkspace);

  describe('constructor', function() {
    it('adds a new middleware node to the graph', function() {
      const middleware = new Middleware(workspace, 'test', {}, {});
      expect(workspace.getNode('Middleware', 'test')).to.be.eql(middleware);
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
    workspace.addDomain('Middleware');
  }
});
