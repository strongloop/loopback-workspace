// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const ModelConfiguration = require('../../lib/datamodel/model-config');
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
      const config = Object.assign({}, data);
      const id = config.id;
      const facetName = config.facetName;
      delete config.id;
      delete config.facetName;
      const connector = ModelConfig.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const modelConfig = new ModelConfiguration(workspace, id, config);
      modelConfig.execute(
      modelConfig.create.bind(modelConfig, id, facetName),
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
      const facet = workspace.getFacet(facetName);
      facet.refresh(function(err) {
        if (err) return cb(err);
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
      const facet = workspace.getFacet(data.facetName);
      const modelConfig = facet.getContainedNode('ModelConfig', id);
      modelConfig.execute(
      modelConfig.update.bind(modelConfig, facet, id, data),
      function(err) {
        if (err) return cb(err);
        const facet = workspace.getFacet(data.facetName);
        const config = facet.getModelConfig(id);
        cb(null, config);
      });
    };
  });
};
