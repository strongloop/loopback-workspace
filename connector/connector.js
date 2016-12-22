'use strict';
var app = require('../server/server.js');
var connector = app.dataSources.db.connector;
var WorkspaceManager = require('../component/workspace-manager.js');

/**
 * @class Connector
 *
 * performs CRUD operations on the Workspace graph.
 */
connector.createModel = function(id, data, cb) {
  var workspace = WorkspaceManager.getWorkspace();
  workspace.addModel(id, data, cb);
};

connector.createDataSource = function(id, data, cb) {
  var workspace = WorkspaceManager.getWorkspace();
  workspace.addDataSource(id, data, cb);
};
