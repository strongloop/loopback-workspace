var app = require('../app');
var WorkspaceEntity = app.models.WorkspaceEntity;
var ComponentDefinition = app.models.ComponentDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('gets the unique identifier of the entity', function() {
      var MyWorkspaceEntity = WorkspaceEntity.extend('MyWorkspaceEntity');
      MyWorkspaceEntity.attachTo(app.dataSources.db);
      MyWorkspaceEntity.belongsTo(ComponentDefinition, {
        as: 'component',
        foreignKey: 'componentName'
      });
      var bar = new MyWorkspaceEntity({
        componentName: 'foo',
        name: 'bar'
      });
      expect(bar.getUniqueId()).to.equal('foo.bar');
    });
  });
});
