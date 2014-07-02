var loopback = require('loopback');
var path = require('path');
var app = require('../app');
var debug = require('debug')('workspace:definition');
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

Definition.loadFromFs = function() {
  throw new Error('not implemented in ' + this.modelName);
}

Definition.saveToFs = function(defs, cb) {
  throw new Error('not implemented in ' + this.modelName);
}

Definition.toArray = function(obj, embed) {
  if(!obj) return [];
  if(Array.isArray(obj)) {
    return obj;
  } else {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
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
            as: relation.embed.name || name,
            type: relation.type,
            foreignKey: relation.foreignKey
          });
        }
      });
  }

  return results;
}

Definition.addRelatedToCache = function(cache, fileData, componentName, fk) {
  var Definition = this;
  this.getEmbededRelations().forEach(function(relation) {
    var relatedData = fileData[relation.as];
    var Entity = loopback.getModel(relation.model);
    var entity;

    if(Array.isArray(relatedData)) {
      relatedData.forEach(function(config) {
        var entity = new Entity(config);
        config[relation.foreignKey] = fk;
        config.componentName = componentName;
        debug('addRelatedToCache %s %j', relation.model, config);
        Entity.addToCache(cache, config);
      });
    } else if(relatedData) {
      Object.keys(relatedData).forEach(function(embedId) {
        var config = relatedData[embedId];
        config[relation.foreignKey] = fk;
        config[relation.embed.key] = embedId;
        config.componentName = componentName;
        debug('addRelatedToCache %s %j', relation.model, config);
        Entity.addToCache(cache, config);
      });
    }
  });
}

function noop() {};

