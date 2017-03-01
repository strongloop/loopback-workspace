// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const ModelHandler = require('../../lib/model-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

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
      workspace.events.model.create(id, data, function(err) {
        cb(err, id);
      });
    };
    ModelDefinition.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.model.refresh(id, function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, [model.getContents()]);
      });
    };
    ModelDefinition.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where && filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      if (id) {
        workspace.events.model.refresh(id, function(err) {
          if (err) return cb(err);
          const model = workspace.getModel(id);
          return cb(null, [model.getContents()]);
        });
      } else {
        return ModelHandler.findAllModels(workspace, cb);
      }
    };
    ModelDefinition.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelDefinition.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.model.update(id, data, function(err, results) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getDefinition());
      });
    };
  });
};

