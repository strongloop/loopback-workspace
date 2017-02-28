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
      ModelHandler.createModelConfig(workspace, id, facetName, modelConfig, cb);
    };
    ModelConfig.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const connector = ModelConfig.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      ModelHandler.findModelConfig(workspace, id, cb);
    };
    ModelConfig.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelConfig.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      ModelHandler.updateModelConfig(workspace, id, data.facetName, data, cb);
    };
  });
};
