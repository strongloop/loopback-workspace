// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const methodHandler = require('../../connector/model-handler');
const WorkspaceManager = require('../../component/workspace-manager.js');

/**
  * Represents a method of a LoopBack `Model`.
  *
  * @class ModelMethod
  */
module.exports = function(ModelMethod) {
  ModelMethod.on('dataSourceAttached', function(eventData) {
    ModelMethod.createModel = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelMethod.getConnector();
      const name = data.name;
      delete data.name;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      methodHandler.createModelMethod(workspace, data.modelId, name, data, cb);
    };
    ModelMethod.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      methodHandler.findModelMethod(workspace, id, cb);
    };
    ModelMethod.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      methodHandler.findModelMethod(workspace, id, cb);
    };
  });
};
