// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const ModelConfig = require('../../lib/datamodel/model-config');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Defines a model configuration which attaches a model to a facet and a
  * dataSource. It also can extend a model definition with additional configuration.
  *
  * @class ModelConfig
  */
module.exports = function(Model) {
  Model.on('dataSourceAttached', function(eventData) {
    function getFacetName(id) {
      const parts = id.split('.');
      return parts[0];
    }
    Model.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = data.id;
      const facetName = data.facetName;
      const modelId = data.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const modelConfig =
        new ModelConfig(workspace, id, data, facetName, modelId);
      modelConfig.execute(
      modelConfig.create.bind(modelConfig, facetName, modelId),
      function(err) {
        cb(err, id);
      });
    };
    Model.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      let facetName = options.facetName;
      if (!facetName) {
        facetName = 'server';
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const facet = workspace.facet(facetName);
      facet.refresh(function(err) {
        if (err) return cb(err);
        if (id) {
          let modelConfig = facet.modelconfig(id);
          if (modelConfig)
            return cb(null, modelConfig.getContents({filter: ['id']}));
          return cb(new Error('model config not found'));
        }
        cb(null, facet.modelconfig().map());
      });
    };
    Model.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const facet = workspace.facet(data.facetName);
      const modelConfig = facet.modelconfig(id);
      modelConfig.execute(
      modelConfig.update.bind(modelConfig, facet, id, data),
      function(err) {
        if (err) return cb(err);
        const facet = workspace.facet(data.facetName);
        const config = facet.modelconfig(id);
        if (!config)
          return cb(new Error('model config not found'));
        cb(null, config);
      });
    };
  });
};
