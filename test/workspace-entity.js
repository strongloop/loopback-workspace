var app = require('../app');
var WorkspaceEntity = app.models.WorkspaceEntity;
var ComponentDefinition = app.models.ComponentDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('gets the unique identifier of the entity', function() {
      var bar = new WorkspaceEntity({
        componentName: 'foo',
        name: 'bar'
      });
      expect(bar.getUniqueId()).to.equal('foo.bar');
    });
  });
});
