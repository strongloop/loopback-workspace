var path = require('path');
var fs = require('fs');
var assert = require('assert');
var extend = require('util')._extend;
var app = require('../app');
var async = require('async');
var underscoreString = require('underscore.string');
var dasherize = underscoreString.dasherize;
var camelize = underscoreString.camelize;
var classify = underscoreString.classify;
var ConfigFile = app.models.ConfigFile;
var _ = require('lodash');

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
ModelDefinition.validatesFormatOf('name', { with: /^[\-_a-zA-Z0-9]+$/ });

ModelDefinition.getConfigFromCache = function(cache, modelDef) {
  var configData = this.getConfigFromData(modelDef);
  var relations = this.getEmbededRelations();
  relations.forEach(function(relation) {
    var relatedData = getRelated(cache, modelDef.id, relation);
    if(relation.model === 'ModelAccessControl') {
      relatedData = relatedData.sort(function(a, b) {
        if (a.index < b.index) {
          return -1;
        }
        if (a.index > b.index) {
          return 1;
        }
        return 0;
      });
    }
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

ModelDefinition.getPath = function(facetName, obj) {
  if(obj.configFile) return obj.configFile;

  // TODO(ritch) the path should be customizable
  return path.join(facetName, ModelDefinition.settings.defaultDir, ModelDefinition.toFilename(obj.name) + '.json');
}

ModelDefinition.toFilename = function(name) {
  if(name === name.toUpperCase()) return name.toLowerCase();
  if(~name.indexOf('-')) return name.toLowerCase();
  var dashed = dasherize(name);
  var split = dashed.split('');
  if(split[0] === '-') split.shift();

  return split.join('');
}

ModelDefinition.removeById = function(id, cb) {
  this.findById(id, function(err, modelDef) {
    if (modelDef.readonly) {
      return cb(new Error('Cannot remove readonly model ' + id));
    }
    var p = ModelDefinition.getPath(modelDef.facetName, modelDef);
    var file = new ConfigFile({path: p});
    file.remove(cb);
  });
}

ModelDefinition.destroyById = ModelDefinition.removeById;
ModelDefinition.deleteById = ModelDefinition.removeById;

ModelDefinition.prototype.remove = function(cb) {
  this.constructor.removeById(this.id, cb);
}

ModelDefinition.prototype.destroy = ModelDefinition.prototype.remove;
ModelDefinition.prototype.delete = ModelDefinition.prototype.remove;

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

ModelDefinition.afterCreate = function(next) {
  var def = this;
  var scriptPath = def.getScriptPath();

  fs.exists(scriptPath, function(exists) {
    if(exists) {
      next();
    } else {
      createScript(def, scriptPath, next);
    }
  });
}

ModelDefinition.prototype.getClassName = function() {
  if(!this.name) return null;
  return classify(dasherize(this.name));
}

ModelDefinition.prototype.getScriptPath = function() {
  var configFilePath = ModelDefinition.getPath(this.facetName, this);
  var scriptFilePath = configFilePath.replace(/\.json$/, '.js');

  return path.join(
    ConfigFile.getWorkspaceDir(),
    scriptFilePath
  );
}

var templatePath = path.join(__dirname, '..', 'templates', 'scripts',
    'model.js.tmpl');
var MODEL_SCRIPT_TEMPLATE = fs.readFileSync(templatePath, 'utf8');

function createScript(def, out, cb) {
  var script;
  try {
    script = _.template(MODEL_SCRIPT_TEMPLATE, {
      modelDef: def,
      modelClassName: def.getClassName()
    });
  } catch(e) {
    return cb(e);
  }
  fs.writeFile(out, script, cb);
}
