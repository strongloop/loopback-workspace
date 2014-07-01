var path = require('path');
var assert = require('assert');
var app = require('../app');
var async = require('async');
var underscoreString = require('underscore.string');
var dasherize = underscoreString.dasherize;
var camelize = underscoreString.camelize;

/**
 * Defines a LoopBack `Model`.
 *
 * @class ModelDefinition
 * @inherits Definition
 */

var ModelDefinition = app.models.ModelDefinition;

/**
 * - `name` is required and must be unique per `ComponentDefinition`
 * 
 * @header Property Validation
 */

ModelDefinition.validatesUniquenessOf('name', { scopedTo: ['app'] });
ModelDefinition.validatesPresenceOf('name');

ModelDefinition.getConfigData = function(cache, modelDef) {
  var configData = {};
  var relations = this.getEmbededRelations();

  configData.name = modelDef.name;

  relations.forEach(function(relation) {
    var relatedData = getRelated(cache, modelDef.name, relation);
    configData[relation.as] = formatRelatedData(relation, relatedData);
  });

  return configData;
}

function getRelated(cache, id, relation) {
  var Definition = app.models[relation.model];
  var cachedData = Definition.allFromCache(cache);
  assert(relation.type === 'hasMany', 'embed only supports hasMany');
  assert(relation.foreignKey, 'embed requires foreignKey');
  return cachedData.filter(function(cached) {
    return cached[relation.foreignKey] === id;
  });
}

function formatRelatedData(relation, relatedData) {
  var result;
  assert(relation.embed && relation.embed.as, 'embed requires "as"');
  switch(relation.embed.as) {
    case 'object':
      assert(relation.embed.key, 'embed as object requires "key"');
      result = {};
      relatedData.forEach(function(related) {
        var key = related[relation.embed.key];
        result[key] = related;
      });
      cleanRelatedData(relatedData, relation);
      return result;
    break;
    case 'array':
      cleanRelatedData(relatedData, relation);
      return relatedData;
    break;
  }
  assert(false, relation.embed.as + ' is not supported by embed');
}

ModelDefinition.getPath = function(app, obj) {
  if(obj.configFile) return obj.configFile;

  // TODO(ritch) the path should be customizable
  return path.join(app, ModelDefinition.settings.defaultDir, ModelDefinition.toFilename(obj.name) + '.json');
}

ModelDefinition.toFilename = function(name) {
  if(name === name.toUpperCase()) return name.toLowerCase();
  if(~name.indexOf('-')) return name.toLowerCase();
  var dashed = dasherize(name);
  var split = dashed.split('');
  if(split[0] === '-') split.shift();

  return split.join('');
}

/**
 * Remove the foreign key from embeded data.
 * @private
 */

function cleanRelatedData(relatedData, relation) {
  relatedData.forEach(function(obj) {
    assert(relation.foreignKey, 'embeded relation must have foreignKey');
    delete obj[relation.foreignKey];    
    delete obj[relation.embed.key];
    // TODO(ritch) we can probably generalize these
    delete obj.id;
    delete obj.componentName;
  });
}
