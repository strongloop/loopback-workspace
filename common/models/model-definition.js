// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../lib/datamodel/model');
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
      const model = new Model(workspace, id, data);
      model.create(function(err) {
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
      const model = workspace.getModel(id);
      model.refresh(function(err) {
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
        const model = workspace.getModel(id);
        model.refresh(function(err) {
          if (err) return cb(err);
          const model = workspace.getModel(id);
          cb(null, [model.getContents()]);
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
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.getModel(id);
      model.update(data, function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getDefinition());
      });
    };
    ModelDefinition.removeModel = function(filter, options, cb) {
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.getModel(id);
      if (!model) return cb(new Error('model does not exist'));
      model.delete(function(err) {
        if (err) return cb(err);
        cb(null, id);
      });
    };
  });
};
