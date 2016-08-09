// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('strong-globalize')();

module.exports = function(Definition) {
  var loopback = require('loopback');
  var clone = require('lodash').clone;
  var debug = require('debug')('workspace:definition');

  /**
   * Base class for LoopBack definitions.
   *
   * @class Definition
   * @inherits WorkspaceEntity
   */

  Definition.loadFromFs = function() {
    throw new Error(g.f('not implemented in %s', this.modelName));
  };

  Definition.saveToFs = function(cache, definitionData, cb) {
    throw new Error(g.f('not implemented in %s', this.modelName));
  };

  Definition.toArray = function(obj, embed) {
    if (!obj) return [];
    if (Array.isArray(obj)) {
      return obj;
    } else {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    }
  };

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

    if (relations) {
      Object
        .keys(relations)
        .forEach(function(name) {
          var relation = relations[name];
          if (relation.embed) {
            results.push({
              embed: relation.embed,
              model: relation.model,
              as: relation.embed.name || name,
              type: relation.type,
              foreignKey: relation.foreignKey,
            });
          }
        });
    }

    return results;
  };

  Definition.addRelatedToCache = function(cache, fileData, facetName, fk) {
    var Definition = this;
    this.getEmbededRelations().forEach(function(relation) {
      var relatedData = fileData[relation.as];
      var Entity = loopback.getModel(relation.model);
      var properties = Entity.definition.properties;

      if (Array.isArray(relatedData)) {
        relatedData.forEach(function(config, index) {
          config[relation.foreignKey] = fk;
          config.facetName = facetName;
          if (relation.embed && relation.embed.includeIndex) {
            config.index = index;
          }
          debug('addRelatedToCache %s %j', relation.model, config);
          Entity.addToCache(cache, config);
        });
      } else if (relatedData) {
        Object.keys(relatedData).forEach(function(embedId) {
          var config = relatedData[embedId];

          if (relation.model === 'ModelProperty' && !(config && config.type)) {
            if (!config) {
              // https://github.com/strongloop/loopback-workspace/issues/223
              // {myProp: false} or {myProp: null} is to hide base myProp
              config = {
                disableInherit: true,
                comments: g.f('Flag to not inherit the property from base'),
              };
            } else {
              // expand shorthand notation
              config = { type: config };
            }
            debug('expanded model property %s.%s defined as %j',
              fileData.name, embedId, config);
          }

          config = Entity.getDataFromConfig(config, embedId);

          // add extra properties for relations
          config[relation.foreignKey] = fk;
          config[relation.embed.key] = embedId;
          config.facetName = facetName;

          debug('addRelatedToCache %s %j', relation.model, config);
          Entity.addToCache(cache, config);
        });
      }
    });
  };

  Definition.addToCache = function(cache, val) {
    // Remove data of embedded relations
    // see https://github.com/strongloop/loopback-datasource-juggler/issues/242
    var data = clone(val);
    this.getEmbededRelations().forEach(function(relation) {
      delete data[relation.as];
    });
    return Definition.base.addToCache.call(this, cache, data);
  };
};
