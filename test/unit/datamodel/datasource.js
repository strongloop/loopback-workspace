// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const DataSource = require('../../../datamodel/datasource');
const expect = require('../../helpers/expect');
const Workspace = require('../../../lib/workspace');

describe('Graph : DataSource', function() {
  let workspace;
  before(createWorkspace);

  describe('constructor', function() {
    it('adds a datasource node to the graph', function() {
      const ds = new DataSource(workspace, 'test', {}, {});
      expect(workspace.getNode('DataSource', 'test')).to.be.eql(ds);
    });
  });

  function createWorkspace() {
    workspace = new Workspace('/');
    workspace.addDomain('DataSource');
  }
});
