// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const app = require('../');
const WorkspaceEntity = app.registry.getModel('WorkspaceEntity');
const Facet = app.models.Facet;
const TestDataBuilder = require('./helpers/test-data-builder');
const expect = require('chai').expect;

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('gets the unique identifier of the entity', function() {
      const MyWorkspaceEntity = WorkspaceEntity.extend('MyWorkspaceEntity');
      MyWorkspaceEntity.attachTo(app.dataSources.db);
      MyWorkspaceEntity.belongsTo(Facet, {
        as: 'facet',
        foreignKey: 'facetName',
      });
      const bar = new MyWorkspaceEntity({
        facetName: 'foo',
        name: 'bar',
      });
      const expected = 'foo.bar';
      expect(bar.getUniqueId()).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar)).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar.toObject())).to.equal(expected);
    });
  });
});
