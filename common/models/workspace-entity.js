// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const g = require('strong-globalize')();

module.exports = function(WorkspaceEntity) {
  const path = require('path');
  const cloneDeep = require('lodash').cloneDeep;
  const app = require('../../server/server');

  WorkspaceEntity.getUniqueId = function(data) {
    const sep = this.settings.idSeparator || '.';
    const parts = this.getUniqueIdParts(data);
    if (parts.length >= 1) {
      return parts.join(sep);
    }
    return null;
  };

  WorkspaceEntity.prototype.getUniqueId = function() {
    return this.constructor.getUniqueId(this);
  };

  WorkspaceEntity.getUniqueIdParts = function(data) {
    const settings = this.settings;
    const parentPropertyName = this.getParentPropertyName();
    const parts = [];
    const parentId = parentPropertyName && data[parentPropertyName];
    const splitParentId = parentId && parentId.split('.');
    const parentIdIsNotRoot = parentId !== '.';
    const name = data.name;

    if (parentPropertyName) {
      if (parentId) {
        if (parentIdIsNotRoot) {
          parts.push.apply(parts, splitParentId);
        }
      } else {
        // cannot construct the id without the parent id
        return [];
      }
    }

    if (name) parts.push(name);

    return parts;
  };

  WorkspaceEntity.getParentPropertyName = function() {
    const relations = this.relations;
    if (!relations) return;

    const relationNames = Object.keys(relations);
    let relation;

    for (let i = 0; i < relationNames.length; i++) {
      relation = relations[relationNames[i]];
      if (relation.type === 'belongsTo') {
        return relation.keyFrom;
      }
    }
  };

  /**
   * Get the Workspace directory.
   *
   * @returns {String} path The directory where the workspace has been loaded.
   */

  WorkspaceEntity.getWorkspaceDir = function() {
    return app.get('workspace dir');
  };

  WorkspaceEntity.getCollection = function() {
    return this.dataSource.connector.getCollection(this.modelName);
  };

  WorkspaceEntity.clearCache = function(cache) {
    // TODO(ritch) should this clear the ids cache?
    cache[this.getCollection()] = {};
  };

  WorkspaceEntity.addToCache = function(cache, val) {
    const Entity = this;
    const id = Entity.getUniqueId(val);
    val[this.dataSource.idName(Entity.modelName)] = id;
    this.updateInCache(cache, id, val);
    return id;
  };

  WorkspaceEntity.getFromCache = function(cache, id) {
    try {
      return JSON.parse(cache[this.getCollection()][id]);
    } catch (err) {
      err.message = g.f('Cannot parse %s #%s. %s',
        this.modelName, id, err.message);
      throw err;
    }
  };

  WorkspaceEntity.updateInCache = function(cache, id, data) {
    cache[this.getCollection()][id] = JSON.stringify(data);
  };

  WorkspaceEntity.allFromCache = function(cache) {
    const data = cache[this.getCollection()];
    if (!data) {
      return [];
    }
    return Object.keys(data)
      .map(this.getFromCache.bind(this, cache));
  };

  WorkspaceEntity.getPath = function(facetName, obj) {
    if (obj && obj.configFile) return obj.configFile;
    return path.join(facetName, this.settings.defaultConfigFile);
  };

  WorkspaceEntity.getDir = function(facetName, obj) {
    return path.dirname(WorkspaceEntity.getPath(facetName, obj));
  };

  WorkspaceEntity.getConfigFile = function(facetName, obj) {
    // TODO(ritch) the bootstrapping of models requires this...
    const ConfigFile = app.models.ConfigFile;
    return new ConfigFile({path: this.getPath(facetName, obj)});
  };

  WorkspaceEntity.prototype.getConfigFile = function() {
    return this.constructor.getConfigFile(this.facetName, this);
  };

  WorkspaceEntity.getConfigFromData = function(data) {
    const properties = this.definition.properties;
    const result = {};
    let prop;

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

  WorkspaceEntity.getDataFromConfig = function(config) {
    const properties = this.definition.properties;
    config = cloneDeep(config);

    Object.keys(properties).forEach(function(p) {
      const json = properties[p].json;
      if (json) {
        config[p] = config[json];
        delete config[json];
      }
    });

    return config;
  };

  // Automatically inject parent model's facetName when creating a new object
  // We have to perform this task before the validations are executed, since
  // the `facetName` is a required property
  WorkspaceEntity.observe('before save', function injectFacetName(ctx, next) {
    const Entity = ctx.Model;
    const properties = Entity.definition.properties;
    const data = ctx.instance ? ctx.instance.toObject() : ctx.data;

    if (!('facetName' in properties &&
      'modelId' in properties &&
      'modelId' in data)) {
      return next();
    }

    Entity.app.models.ModelDefinition.findById(data.modelId, function(err, model) {
      if (model && model.facetName) {
        if (data.facetName && data.facetName !== model.facetName) {
          g.warn(
            'Warning: fixed %s[%s].facetName from %j to %j' +
              ' to match the parent',
            Entity.modelName,
            data.id,
            data.facetName,
            model.facetName,
          );
        }
        (ctx.instance || ctx.data).facetName = model.facetName;
      }
      next();
    });
  });
};
