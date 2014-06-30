var app = require('../app');
var WorkspaceEntity = app.models.WorkspaceEntity;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('WorkspaceEntity', function() {
  describe('workspaceEntity.getUniqueId()', function() {
    it('get the unique identifier of the entity', function() {
      var bar = new WorkspaceEntity({
        componentName: 'foo',
        name: 'bar'
      });
      expect(bar.getUniqueId()).to.equal('foo.bar');
    });
  });
});
