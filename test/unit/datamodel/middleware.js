// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Middleware = require('../../../lib/datamodel/middleware');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : Middleware', function() {
  let workspace;
  before(createWorkspace);

  describe('constructor', function() {
    it('creates a new middleware node', function() {
      const middleware = new Middleware(workspace, 'test', {}, {});
      expect(middleware._name).to.be.eql('test');
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
  }
});
