// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../');
var WorkspaceEntity = app.registry.getModel('WorkspaceEntity');
var Facet = app.models.Facet;
var TestDataBuilder = require('./helpers/test-data-builder');

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('gets the unique identifier of the entity', function() {
      var MyWorkspaceEntity = WorkspaceEntity.extend('MyWorkspaceEntity');
      MyWorkspaceEntity.attachTo(app.dataSources.db);
      MyWorkspaceEntity.belongsTo(Facet, {
        as: 'facet',
        foreignKey: 'facetName',
      });
      var bar = new MyWorkspaceEntity({
        facetName: 'foo',
        name: 'bar',
      });
      var expected = 'foo.bar';
      expect(bar.getUniqueId()).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar)).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar.toObject())).to.equal(expected);
    });
  });
});
