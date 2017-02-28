// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const ModelHandler = require('../../lib/model-handler');
const WorkspaceManager = require('../../component/workspace-manager.js');

module.exports = function(ModelDefinition) {
  /**
   * Creates a model definition.
   *
   * @class ModelDefinition
   */
  ModelDefinition.on('dataSourceAttached', function(eventData) {
    ModelDefinition.createModel = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = data.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      ModelHandler.createModel(workspace, id, data, cb);
    };
    ModelDefinition.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      ModelHandler.findModel(workspace, id, cb);
    };
    ModelDefinition.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where && filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      if (id)
        ModelHandler.findModel(workspace, id, cb);
      else
        ModelHandler.findAllModels(workspace, cb);
    };
    ModelDefinition.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelDefinition.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      ModelHandler.updateModel(workspace, id, data, cb);
    };
  });
};
