// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../lib/datamodel/model');
const Method = require('../../lib/datamodel/model-method');
const methodHandler = require('../../lib/model-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

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
      const modelId = data.modelId;
      delete data.name;
      delete data.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const method = new Method(workspace, name, data);
      method.execute(
      method.create.bind(method, modelId),
      function(err) {
        cb(err, name);
      });
    };
    ModelMethod.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const modelId = filter.where.modelId;
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.getModel(modelId);
      model.execute(
      model.refresh.bind(model),
      function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getMethodDefinitions());
      });
    };
    ModelMethod.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.getModel(id);
      model.execute(
      model.refresh.bind(model),
      function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getMethodDefinitions());
      });
    };
  });
};
