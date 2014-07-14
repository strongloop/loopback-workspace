var path = require('path');
var app = require('../app');
var WorkspaceEntity = app.model('WorkspaceEntity', {
  "properties": {
    "configFile": {"type": "string", "json": false}
  },
  "public": false,
  "dataSource": "db"
});

WorkspaceEntity.getUniqueId = function(data) {
  var sep = this.settings.idSeparator || '.';
  var parts = this.getUniqueIdParts(data);
  if(parts.length >= 1) {
    return parts.join(sep);
  }
  return null;
}

WorkspaceEntity.prototype.getUniqueId = function() {
  return this.constructor.getUniqueId(this);
}

WorkspaceEntity.getUniqueIdParts = function(data) {
  var settings = this.settings;
  var parentPropertyName = this.getParentPropertyName();
  var parts = [];
  var parentId = parentPropertyName && data[parentPropertyName];
  var splitParentId = parentId && parentId.split('.');
  var parentIdIsNotRootComponent = parentId !== '.';
  var name = data.name;

  if(parentPropertyName) {
    if(parentId) {
      if(parentIdIsNotRootComponent) {
        parts.push.apply(parts, splitParentId);
      }
    } else {
      // cannot construct the id without the parent id
      return [];
    }
  }
  
  if(name) parts.push(name);

  return parts;
}

WorkspaceEntity.getParentPropertyName = function() {
  var relations = this.relations;
  if(!relations) return;

  var relationNames = Object.keys(relations);
  var relation;

  for(var i = 0; i < relationNames.length; i++) {
    relation = relations[relationNames[i]];
    if(relation.type === 'belongsTo') {
      return relation.keyFrom;
    }
  }
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
  var id = Entity.getUniqueId(val);
  val[this.dataSource.idName(Entity.modelName)] = id;
  this.updateInCache(cache, id, val);
  return id;
}

WorkspaceEntity.getFromCache = function(cache, id) {
  return JSON.parse(cache[this.modelName][id]);
}

WorkspaceEntity.updateInCache = function(cache, id, data) {
  cache[this.modelName][id] = JSON.stringify(data);
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

WorkspaceEntity.getConfigFromData = function(data) {
  var properties = this.definition.properties;
  var result = {};
  var prop;

  // add pre-defined properties in the order defined by LDL
  // apply `json` config from LDL along the way
  for (prop in properties) {
    if (properties[prop].json === false) continue;
    result[properties[prop].json || prop] = data[prop];
  }

  // add dynamic properties
  for (prop in data) {
    if (properties[prop]) continue;
    result[prop] = data[prop];
  }

  return result;
};

// Automatically inject parent model's componentName when creating a new object
// We have to perform this task before the validations are executed, since
// the `componentName` is a required property
WorkspaceEntity.beforeValidate = function injectComponentName(next) {
  var Entity = this.constructor;
  var properties = Entity.definition.properties;
  var data = this.toObject();

  if (!('componentName' in properties &&
    'modelId' in properties &&
    'modelId' in data)) {
    return next();
  }

  Entity.app.models.ModelDefinition.findById(data.modelId, function(err, model) {
    if (model && model.componentName) {
      if (this.componentName && this.componentName !== model.componentName) {
        console.warn(
          'Warning: fixed %s[%s].componentName from %j to %j' +
            ' to match the parent',
          Entity.modelName,
          this.id,
          this.componentName,
          model.componentName);
      }
      this.componentName = model.componentName;
    }
    next();
  }.bind(this));
};
