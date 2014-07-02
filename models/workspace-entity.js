var path = require('path');
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

WorkspaceEntity.clearCache = function(cache) {
  // TODO(ritch) should this clear the ids cache?
  cache[this.modelName] = {};
}

WorkspaceEntity.addToCache = function(cache, id, val) {
  cache[this.modelName][id] = JSON.stringify(val);
}

WorkspaceEntity.getFromCache = function(cache, id) {
  return JSON.parse(cache[this.modelName][id]);
}

WorkspaceEntity.allFromCache = function(cache) {
  return Object.keys(cache[this.modelName])
    .map(this.getFromCache.bind(this, cache));
}

WorkspaceEntity.getPath = function(componentName, obj) {
  if(obj.configFile) return obj.configFile;
  return path.join(componentName, this.settings.defaultConfigFile);
}

WorkspaceEntity.getDir = function(componentName, obj) {
  return path.dirname(WorkspaceEntity.getPath(componentName, obj));
}

WorkspaceEntity.getConfigFile = function(componentName, obj) {
  // TODO(ritch) the bootstrapping of models requires this...
  var ConfigFile = app.models.ConfigFile;
  return new ConfigFile({path: this.getPath(componentName, obj)});
}
