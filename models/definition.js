var path = require('path');
var app = require('../app');
var models = require('../models.json');

/**
 * Base class for LoopBack definitions.
 *
 * @class Definition
 * @inherits WorkspaceEntity
 */

var Definition = app.model('Definition', {
  "properties": {
    "name": {
      "type": "string",
      "id": true,
      "required": true
    },
    "dir": {
      "type": "string",
      "desc": "the directory name where the definition is persisted"
    }
  },
  "public": false,
  "dataSource": "db",
  "options": {
    "base": "WorkspaceEntity"
  }
});

/**
 * Return the object in its form to be written to config.
 * 
 * **Note:** sub-classes should override this method to customize
 * how they are written to a config file.
 *
 * @returns {Object}
 */

Definition.prototype.toConfig = function() {
  return this.toJSON();
}

/**
 * Constructs the `Definition` from the serialized config value.
 * 
 * **Note:** sub-classes should override this method to customize
 * how they are read to from config file.
 *
 * @returns {Object}
 */

Definition.fromConfig = function(config) {
  var Constructor = this;
  return new Constructor(config);
}

/**
 * Called internally when underlying config has been `touched`.
 */

Definition.prototype.touch = function() {

}

/**
 * Get the absolute directory that contains the `Definition`.
 *
 * @returns {String} dir
 */

Definition.prototype.getDir = function() {
  return path.join(WorkspaceEntity.getWorkspaceDir(), this.name);
}

Definition.getEmbededRelations = function() {
  var relations = this.settings.relations;
  var results = [];
  
  if(relations) {
    Object
      .keys(relations)
      .forEach(function(name) {
        var relation = relations[name];
        if(relation.embed) {
          results.push({
            model: relation.model,
            as: name
          });
        }
      });
  }

  return results;
}

Definition.prototype.toConfig = function(cb) {
  var config = this.toJSON();
  config.configFile = this.getConfigFile();
  process.nextTick(function() {
    cb(null, config);
  });
}

Definition.toConfig = function(def, cb) {
  def.toConfig(cb);
}

Definition.mergeConfigs = function(configs, file) {
  var merged = {configFile: file};
  configs.forEach(function(config) {
    merged[config.name] = config;
  });
  return merged;
}

Definition.prototype.getConfigFile = function(cb) {
  var settings = this.constructor.settings;
  var defaultConfigFile = settings.defaultConfigFile || settings.configFiles[0];

  if(defaultConfigFile) {
    defaultConfigFile = defaultConfigFile.replace('$id', this.getConfigFilename());
  }

  return this.configFile
    || path.join(this.getAppDir(), defaultConfigFile);
}

Definition.prototype.getConfigFilename = function() {
  return this.name || this.dir;
}

Definition.toFileData = function(configs, file) {
  // if in a multiple file => convert to object
  //  remove name
  // otherwise return the first in the array
}

Definition.fromFileData = function(fileData, file) {
  // if in a multiple file => convert from object to array
  //  add name
  // otherwise return the first in the array
}

Definition.prototype.getAppDir = function() {
  var app = this.app;

  if(typeof app !== 'string') {
    app = this.appName;
  }

  return app;
}

Definition.relatedToConfig = function(relation, related) {
  var result = {};
  if(relation.storeAsObject) {
    related.forEach(function() {
      result[obj.name] = obj;
    });
  } else {
    result = related;
  }
  return result;
}
