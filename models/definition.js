var loopback = require('loopback');
var path = require('path');
var app = require('../app');
var ConfigFile = app.models.ConfigFile;

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

Definition.getCache = function() {
  return this.dataSource.connector.cache;
}

Definition.loadFromFs = function() {
  throw new Error('not implemented in ' + this.modelName);
}

Definition.saveToFs = function(defs, cb) {
  throw new Error('not implemented in ' + this.modelName);
}

Definition.clearCache = function() {
  this.getCache()[this.modelName] = {};
  this.dataSource.connector.ids[this.modelName] = {};
}

Definition.addToCache = function(id, val) {
  this.getCache()[this.modelName][id] = JSON.stringify(val);
}

Definition.getFromCache = function(id) {
  return JSON.parse(this.getCache()[this.modelName][id]);
}

Definition.allFromCache = function(id, val) {
  var self = this;
  return Object.keys(this.getCache()[this.modelName])
    .map(self.getFromCache.bind(self));
}

Definition.getRelatedModels = function() {
  var relations = this.settings.relations || {};
  var models = [];

  Object.keys(relations).forEach(function(modelName) {
    loopback
  });

  return models;
}


Definition.toArray = function(obj) {
  if(!obj) return [];
  if(Array.isArray(obj)) {
    return obj;
  }
}

/**
 * Get the embeded relations for a `Definition`. Only relations that specify
 * a `embed` property will be included.
 *
 * **Embed Setting**
 *
 * The following is the two basic types of embeds:
 *
 * ```js
 * "relations": { "things": { "embed": { "as": "array" } } }
 * ```
 *
 * or
 *
 * ```js
 * "relations": { "things": { "embed": { "as": "object", "key": "id" } } }
 * ```
 * 
 * **Relations**
 *
 * Each item in the relations array has the following structure:
 *
 * ```js
 * {
 *   model: 'DefintionModelName', // eg. ModelDefinition
 *   as: 'relationPropertyName', // eg. properties
 *   type: 'hasMany'
 * }
 * ```
 *
 * @returns {Array} relations
 */

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
            embed: relation.embed,
            model: relation.model,
            as: name,
            type: relation.type
          });
        }
      });
  }

  return results;
}

Definition.addRelatedToCache = function(name, fileData) {
  var Definition = this;
  this.getEmbededRelations().forEach(function(relation) {
    Definition.toArray(fileData[relation.as]).forEach(function(config) {
      Definition.addToCache(relation.model, config);
    });
  });
}


Definition.getPath = function(app, obj) {
  if(obj.configFile) return obj.configFile;
  return path.join(app, this.settings.defaultConfigFile);
}

Definition.getConfigFile = function(appName, obj) {
  // TODO(ritch) the bootstrapping of models requires this...
  var ConfigFile = app.models.ConfigFile;
  return new ConfigFile({path: this.getPath(appName, obj)});
}

function noop() {};

