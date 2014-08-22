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
  var parentIdIsNotRoot = parentId !== '.';
  var name = data.name;

  if(parentPropertyName) {
    if(parentId) {
      if(parentIdIsNotRoot) {
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

WorkspaceEntity.getPath = function(facetName, obj) {
  if(obj.configFile) return obj.configFile;
  return path.join(facetName, this.settings.defaultConfigFile);
}

WorkspaceEntity.getDir = function(facetName, obj) {
  return path.dirname(WorkspaceEntity.getPath(facetName, obj));
}

WorkspaceEntity.getConfigFile = function(facetName, obj) {
  // TODO(ritch) the bootstrapping of models requires this...
  var ConfigFile = app.models.ConfigFile;
  return new ConfigFile({path: this.getPath(facetName, obj)});
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

// Automatically inject parent model's facetName when creating a new object
// We have to perform this task before the validations are executed, since
// the `facetName` is a required property
WorkspaceEntity.beforeValidate = function injectFacetName(next) {
  var Entity = this.constructor;
  var properties = Entity.definition.properties;
  var data = this.toObject();

  if (!('facetName' in properties &&
    'modelId' in properties &&
    'modelId' in data)) {
    return next();
  }

  Entity.app.models.ModelDefinition.findById(data.modelId, function(err, model) {
    if (model && model.facetName) {
      if (this.facetName && this.facetName !== model.facetName) {
        console.warn(
          'Warning: fixed %s[%s].facetName from %j to %j' +
            ' to match the parent',
          Entity.modelName,
          this.id,
          this.facetName,
          model.facetName);
      }
      this.facetName = model.facetName;
    }
    next();
  }.bind(this));
};

WorkspaceEntity.getAllConfigFiles = function(filter, cb) {
  // find paths based on a glob???
}

WorkspaceEntity.getAllFromFiles = function(files, cb) {
  var result = [];
  var Entity = this;
  
  async.each(files, function(file, cb) {
    if(Entity.isEmbeded()) {
      result = result.concat(Entity.getAllFromFile(file));
    } else {
      var data = Entity.getFromFile(file);
      if(data) result.push(data);
    }
  }, function(err) {
    if(err) return cb(err);
    cb(null, result);
  });
}

WorkspaceEntity.getAllFromFile = function(file) {
  var result;
  var key = this.settings.embedAs;
  var all = file.data[key];
  switch(settings.embed.as) {
    case 'object':
      result = Object.keys(all).map(function(key) {
        return all[key];
      });
    break;
    default:
      result = all;
    break;
  }
  return result;
}

WorkspaceEntity.getFromFile = function(file) {
  return file.data;
}

WorkspaceEntity.addToFile = function(file, data) {
  file.data = data;
}
