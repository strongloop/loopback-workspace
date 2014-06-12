var app = require('../app');
var WorkspaceEntity = app.model('WorkspaceEntity', {
  "properties": {
    "configFile": {"type": "string"},
    "scriptFile": {"type": "string"},
    "configLineNum": {"type": "number"},
    "locked": {"type": "boolean"}
  },
  "public": false,
  "dataSource": "db"
});

/**
 * Get the file location of the entity.
 * 
 * @returns {String} location For example
 * `"/foo/bar/bat/baz.json:237"`
 */

WorkspaceEntity.prototype.getLocation = function() {
  throwMustImplement('getLocation', this.constructor);
}

function throwMustImplement(name, constructor) {
  throw new Error('must be implemented by ', constructor.name);
}

/**
 * Get the Workspace directory.
 *
 * @returns {String} path The directory where the workspace has been loaded.
 */

WorkspaceEntity.getWorkspaceDir = function() {
  return app.get('workspace dir');
}
