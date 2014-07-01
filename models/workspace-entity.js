var path = require('path');
var app = require('../app');
var WorkspaceEntity = app.model('WorkspaceEntity', {
  "properties": {
    "configFile": {"type": "string"},
    "componentName": {"type": "string"} /* , required: true */
  },
  "public": false,
  "dataSource": "db"
});

WorkspaceEntity.prototype.getUniqueId = function() {
  var sep = this.constructor.settings.idSeparator || '.';
  var parts = this.getUniqueIdParts();
  if(parts.length >= 1) {
    return parts.join(sep);
  }
  return null;
}

WorkspaceEntity.prototype.getUniqueIdParts = function() {
  var settings = this.constructor.settings;
  var includeIdPart = settings.includeIdPart;
  var parts = [];
  var requiredParts = 2;

  if(includeIdPart) requiredParts++;
  if(this.componentName) {
    if(this.componentName === '.') {
      requiredParts--;
    } else {
      parts.push(this.componentName);
    }
  }
  if(includeIdPart && this[includeIdPart]) {
    parts.push(this[includeIdPart]);
  }
  if(this.name) parts.push(this.name);

  if(parts.length === requiredParts) return parts;
  return [];
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

WorkspaceEntity.addToCache = function(cache, val) {
  var Entity = this;
  var entity = new Entity(val);
  var id = entity.getUniqueId();
  val[this.dataSource.idName(Entity.modelName)] = id;
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
