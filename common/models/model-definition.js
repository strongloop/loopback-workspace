// Copyright IBM Corp. 2015,2017. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const g = require('strong-globalize')();
const app = require('../../server/server');
const debug = require('debug')('workspace:model-definition');

module.exports = function(ModelDefinition) {
  app.once('ready', function() {
    ready(ModelDefinition);
  });
};

function ready(ModelDefinition) {
  const path = require('path');
  const fs = require('fs');
  const assert = require('assert');
  const extend = require('util')._extend;
  const async = require('async');
  const ConfigFile = app.models.ConfigFile;
  const _ = require('lodash');

  /**
   * Defines a LoopBack `Model`.
   *
   * @class ModelDefinition
   * @inherits Definition
   */

  /**
   * - `name` is required and must be unique per `Facet`
   *
   * @header Property Validation
   */

  ModelDefinition.validatesUniquenessOf('name', {scopedTo: ['app']});
  ModelDefinition.validatesPresenceOf('name');
  ModelDefinition.validatesFormatOf('name', {with: /^[\-_a-zA-Z0-9]+$/});

  ModelDefinition.getConfigFromCache = function(cache, modelDef) {
    const configData = this.getConfigFromData(modelDef);
    const relations = this.getEmbededRelations();
    relations.forEach(function(relation) {
      let relatedData = getRelated(cache, modelDef.id, relation);
      if (relation.model === 'ModelAccessControl') {
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
  };

  function getRelated(cache, id, relation) {
    const Definition = app.models[relation.model];
    const cachedData = Definition.allFromCache(cache);
    assert(relation.type === 'hasMany', g.f('embed only supports hasMany'));
    assert(relation.foreignKey, g.f('embed requires foreignKey'));
    return cachedData.filter(function(cached) {
      return cached[relation.foreignKey] === id;
    });
  }

  function formatRelatedData(relation, relatedData) {
    let result;
    assert(relation.embed && relation.embed.as, g.f('embed requires "as"'));
    switch (relation.embed.as) {
      case 'object':
        assert(relation.embed.key || relation.embed.keyGetter,
          g.f('embed as object requires "key" or "keyGetter"'));
        result = {};
        relatedData.forEach(function(related) {
          const Definition = app.models[relation.model];
          let key;
          if (relation.embed.key) {
            key = related[relation.embed.key];
          }
          const keyGetter = relation.embed.keyGetter;
          if (keyGetter && typeof Definition[keyGetter] === 'function') {
            key = Definition[keyGetter](related.name, related);
          }
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
    assert(false, g.f('%s is not supported by embed', relation.embed.as));
  }

  ModelDefinition.getPath = function(facetName, obj) {
    if (obj.configFile) return obj.configFile;

    // TODO(ritch) the path should be customizable
    return path.join(facetName, ModelDefinition.settings.defaultDir,
      ModelDefinition.toFilename(obj.name) + '.json');
  };

  ModelDefinition.toFilename = function(name) {
    if (name === name.toUpperCase()) return name.toLowerCase();
    if (~name.indexOf('-')) return name.toLowerCase();
    const dashed = _.kebabCase(name);
    const split = dashed.split('');
    if (split[0] === '-') split.shift();

    return split.join('');
  };

  const removeById = ModelDefinition.removeById.bind(ModelDefinition);

  ModelDefinition.removeById = function(id, cb) {
    debug('removing model: %s', id);

    this.findById(id, function(err, modelDef) {
      if (err) {
        return cb(err);
      }

      if (!modelDef) {
        return cb(new Error(g.f('ModelDefinition %s does not exist', id)));
      }

      if (modelDef.readonly) {
        return cb(new Error(g.f('Cannot remove readonly model %s' + id)));
      }
      removeById(id, function(err) {
        if (err) return cb(err);

        function removeModelDef(cb) {
          const p = ModelDefinition.getPath(modelDef.facetName, modelDef);
          const file = new ConfigFile({path: p});
          file.remove(cb);
        }
        function removeModelDefJs(cb) {
          fs.unlink(modelDef.getScriptPath(), cb);
        }
        async.parallel([
          removeModelDef,
          removeModelDefJs,
        ], function(err, results) {
          if (err) return cb(err);

          cb(null, {result: results});
        });
      });
    });
  };

  ModelDefinition.destroyById = ModelDefinition.removeById;
  ModelDefinition.deleteById = ModelDefinition.removeById;

  ModelDefinition.prototype.remove = function(cb) {
    this.constructor.removeById(this.id, cb);
  };

  ModelDefinition.prototype.destroy = ModelDefinition.prototype.remove;
  ModelDefinition.prototype.delete = ModelDefinition.prototype.remove;

  /**
   * Remove the foreign key from embeded data and sort the properties in
   * a well-defined order.
   * @private
   */

  function cleanRelatedData(relatedData, relation) {
    assert(relation.foreignKey, g.f('embeded relation must have foreignKey'));

    const Entity = require('loopback').getModel(relation.model);
    for (const ix in relatedData) {
      let data = Entity.getConfigFromData(relatedData[ix]);
      delete data[relation.foreignKey];
      delete data[relation.embed.key];

      // Convert the disableInherit placeholder (myBaseProp: false) back to false
      if (relation.model === 'ModelProperty' && data.disableInherit) {
        data = false;
      }
      relatedData[ix] = data;
    }
  }

  ModelDefinition.observe('after save', function(ctx, next) {
    if (!ctx.isNewInstance) return next();

    const def = ctx.instance;
    const scriptPath = def.getScriptPath();

    fs.exists(scriptPath, function(exists) {
      if (exists) {
        next();
      } else {
        createScript(def, scriptPath, next);
      }
    });
  });

  ModelDefinition.prototype.getClassName = function() {
    if (!this.name) return null;
    return _.capitalize(_.camelCase(this.name));
  };

  ModelDefinition.prototype.getScriptPath = function() {
    const configFilePath = ModelDefinition.getPath(this.facetName, this);
    const scriptFilePath = configFilePath.replace(/\.json$/, '.js');

    return path.join(
      ConfigFile.getWorkspaceDir(),
      scriptFilePath,
    );
  };

  const templatePath = path.join(__dirname, '..', '..', 'templates', 'scripts',
    'model.js.tmpl');
  const MODEL_SCRIPT_TEMPLATE = fs.readFileSync(templatePath, 'utf8');

  function createScript(def, out, cb) {
    let script;
    try {
      script = _.template(MODEL_SCRIPT_TEMPLATE)({
        modelDef: def,
        modelClassName: def.getClassName(),
      });
    } catch (e) {
      return cb(e);
    }
    fs.writeFile(out, script, cb);
  }
}
