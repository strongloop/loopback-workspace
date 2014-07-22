var path = require('path');
var assert = require('assert');
var extend = require('util')._extend;
var app = require('../app');
var async = require('async');
var underscoreString = require('underscore.string');
var dasherize = underscoreString.dasherize;
var classify = underscoreString.classify;
var CodeFile = app.models.CodeFile;

/**
 * Defines a LoopBack `Model`.
 *
 * @class ModelDefinition
 * @inherits Definition
 */

var ModelDefinition = app.models.ModelDefinition;

/**
 * - `name` is required and must be unique per `Facet`
 * 
 * @header Property Validation
 */

ModelDefinition.validatesUniquenessOf('name', { scopedTo: ['app'] });
ModelDefinition.validatesPresenceOf('name');

ModelDefinition.getConfigFromCache = function(cache, modelDef) {
  var configData = this.getConfigFromData(modelDef);
  var relations = this.getEmbededRelations();
  relations.forEach(function(relation) {
    var relatedData = getRelated(cache, modelDef.id, relation);
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
      cleanRelatedData(result, relation);
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

ModelDefinition.afterCreate = function(next) {
  var def = this;
  var script = def.getScriptFile();
  script.exists(function(err, exists) {
    if(err || exists) return next(err);
    script.render({ model: def }, next);
  });
}

ModelDefinition.prototype.getClassName = function() {
  if(!this.name) return null;
  return classify(dasherize(this.name));
}

ModelDefinition.prototype.getScriptFile = function() {
  var script = ModelDefinition.toFilename(this.name) + '.js';
  var file = path.join(this.facetName, ModelDefinition.settings.defaultDir, script);
  return new CodeFile({
    path: file,
    template: 'model'
  });
}

/**
 * Remove the foreign key from embeded data and sort the properties in
 * a well-defined order.
 * @private
 */

function cleanRelatedData(relatedData, relation) {
  assert(relation.foreignKey, 'embeded relation must have foreignKey');

  var Entity = require('loopback').getModel(relation.model);
  for (var ix in relatedData) {
    var data = Entity.getConfigFromData(relatedData[ix]);
    delete data[relation.foreignKey];
    delete data[relation.embed.key];
    relatedData[ix] = data;
  }
}
