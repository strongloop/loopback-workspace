// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const templateRegistry = require('../../lib/template-registry');
const WorkspaceManager = require('../../lib/workspace-manager');
const WorkspaceHandler = require('../../lib/workspace-handler');
const TemplateHandler = require('../../lib/template-handler');
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

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
      const workspace = WorkspaceManager.createWorkspace(destinationPath);
      TemplateHandler.createFromTemplate(workspace, template, cb);
    };
    Workspace.loadWorkspace = function(workspaceDir, cb) {
      const workspace = WorkspaceManager.createWorkspace(workspaceDir);
      workspace.loadAll(cb);
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
      let app, ds, result;

      async.series([
        function bootApp(next) {
          app = loopback();
          const dir = path.join(workspace.getDirectory(), 'server');
          boot(app, dir, next);
        },
        function migrate(next) {
          ds = app.dataSources[dataSourceName];
          ds.automigrate(modelName, next);
        }],
      function(err) {
        ds.discoverSchemas(modelName, {}, cb);
      });
    };

    Workspace.remoteMethod('migrateDataSource', {
      accepts: [
        {arg: 'workspaceId', type: 'string'},
        {arg: 'dataSourceName', type: 'string'},
        {arg: 'modelName', type: 'string'},
      ],
      returns: {arg: 'success', type: 'boolean'},
      http: {verb: 'POST', path: '/migrateDataSource'},
    });
  });
};
