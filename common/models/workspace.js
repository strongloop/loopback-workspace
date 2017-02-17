// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const dataSourceHandler = require('../../connector/data-source-handler');
const templateRegistry = require('../../component/template-registry');
const WorkspaceManager = require('../../component/workspace-manager.js');

/**
  * Represents a LoopBack Workspace.
  *
  * @class Workspace
  */
module.exports = function(Workspace) {
  Workspace.on('dataSourceAttached', function(eventData) {
    Workspace.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const template = templateRegistry.getTemplate(data.templateName);
      if (!template) {
        return cb('Template not found');
      }
      const destinationPath = data.destinationPath;
      const connector = Workspace.getConnector();
      connector.createFromTemplate(template, destinationPath, cb);
    };
    Workspace.loadWorkspace = function(workspaceDir, cb) {
      const connector = Workspace.getConnector();
      connector.loadWorkspace(workspaceDir, cb);
    };
    Workspace.remoteMethod('loadWorkspace', {
      accepts: [{
        arg: 'directory',
        type: 'string'}],
      returns: [{
        arg: 'response',
        type: 'object',
        http: {source: 'res'},
        root: true}],
      http: {
        verb: 'POST',
        path: '/load-workspace',
      },
    });
    /**
    * Run a migration on the data source. Creates indexes, tables, collections, etc.
    * **NOTE: this will destroy any existing data**
    *
    * @param {string} modelName
    * @callback {Function} callback
    */
    Workspace.migrateDataSource =
    function(workspaceId, dataSourceName, modelName, cb) {
      const workspace = WorkspaceManager.getWorkspace(workspaceId);
      dataSourceHandler.autoMigrate(workspace, dataSourceName, modelName, cb);
    };

    Workspace.remoteMethod('migrateDataSource', {
      accepts: [
        {arg: 'workspaceId',
          type: 'string'},
        {arg: 'dataSourceName',
          type: 'string'},
        {arg: 'modelName',
          type: 'string'},
      ],
      returns: {arg: 'success', type: 'boolean'},
      http: {verb: 'POST', path: '/migrateDataSource'},
    });
  });
};
