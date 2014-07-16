var app = require('../app');
var WorkspaceEntity = app.models.WorkspaceEntity;
var Facet = app.models.Facet;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('gets the unique identifier of the entity', function() {
      var MyWorkspaceEntity = WorkspaceEntity.extend('MyWorkspaceEntity');
      MyWorkspaceEntity.attachTo(app.dataSources.db);
      MyWorkspaceEntity.belongsTo(Facet, {
        as: 'facet',
        foreignKey: 'facetName'
      });
      var bar = new MyWorkspaceEntity({
        facetName: 'foo',
        name: 'bar'
      });
      var expected = 'foo.bar';
      expect(bar.getUniqueId()).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar)).to.equal(expected);
      expect(MyWorkspaceEntity.getUniqueId(bar.toObject())).to.equal(expected);
    });
  });
});
