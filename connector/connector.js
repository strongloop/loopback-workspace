'use strict';
const app = require('../server/server.js');
const connector = app.dataSources.db.connector;
const WorkspaceManager = require('../component/workspace-manager.js');

/**
 * @class Connector
 *
 * performs CRUD operations on the Workspace graph.
 */
connector.createModel = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  workspace.addModel(id, data, cb);
};

connector.createDataSource = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  workspace.addDataSource(id, data, cb);
};

connector.createModelProperty = function(modelId, propertyName, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  workspace.addModelProperty(modelId, propertyName, data, cb);
};
