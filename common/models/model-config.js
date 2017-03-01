// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const ModelHandler = require('../../lib/model-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Defines a model configuration which attaches a model to a facet and a
  * dataSource. It also can extend a model definition with additional configuration.
  *
  * @class ModelConfig
  */
module.exports = function(ModelConfig) {
  ModelConfig.on('dataSourceAttached', function(eventData) {
    function getFacetName(id) {
      const parts = id.split('.');
      return parts[0];
    }
    ModelConfig.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const modelConfig = Object.assign({}, data);
      const id = modelConfig.id;
      const facetName = modelConfig.facetName;
      delete modelConfig.id;
      delete modelConfig.facetName;
      const connector = ModelConfig.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.modelconfig.create(id, facetName, modelConfig,
        function(err) {
          cb(err, id);
        });
    };
    ModelConfig.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const facetName = getFacetName(id);
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.modelconfig.refresh(facetName, function(err) {
        if (err) return cb(err);
        const facet = workspace.getFacet(facetName);
        const config = facet.getModelConfig(id);
        cb(null, config);
      });
    };
    ModelConfig.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelConfig.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.modelconfig.update(data.facetName, id, data,
        function(err) {
          if (err) return cb(err);
          const facet = workspace.getFacet(data.facetName);
          const config = facet.getModelConfig(id);
          cb(null, config);
        });
    };
  });
};
