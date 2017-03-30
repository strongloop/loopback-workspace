// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../lib/datamodel/model');
const ModelHandler = require('../../lib/actions/model');
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
      const modelId = data.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = new Model(workspace, modelId, data);
      model.execute(
      model.create.bind(model),
      function(err) {
        cb(err, modelId);
      });
    };
    ModelDefinition.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.model(id);
      model.execute(
      model.refresh.bind(model),
      function(err) {
        if (err) return cb(err);
        const model = workspace.model(id);
        cb(null, [model.getContents()]);
      });
    };
    ModelDefinition.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where && filter.where.id;
      const workspaceId = options.workspaceId;
      const workspace = WorkspaceManager.getWorkspace(workspaceId);
      if (id) {
        const model = workspace.model(id);
        model.execute(
        model.refresh.bind(model),
        function(err) {
          if (err) return cb(err);
          const model = workspace.model(id);
          cb(null, [model.getContents()]);
        });
      } else {
        const taskList = [];
        taskList.push(workspace.refreshModels.bind(workspace));
        workspace.execute(taskList,
        function(err) {
          if (err) return cb(err);
          const models = workspace.models();
          if (!models)
            return cb(new Error('No model definitions found'));
          let results = [];
          models.forEach(function(model) {
            results.push(model.getDefinition());
          });
          cb(null, results);
        });
      }
    };
    ModelDefinition.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.model(id);
      model.execute(
      model.update.bind(model, data),
      function(err) {
        if (err) return cb(err);
        const model = workspace.model(id);
        cb(null, model.getDefinition());
      });
    };
    ModelDefinition.removeModel = function(filter, options, cb) {
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.model(id);
      if (!model) return cb(new Error('model does not exist'));
      model.execute(
      model.delete.bind(model),
      function(err) {
        if (err) return cb(err);
        cb(null, id);
      });
    };
  });
};
