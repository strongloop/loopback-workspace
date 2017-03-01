// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const middlewareHandler = require('../../lib/middleware-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Defines a `MiddlewarePhase` configuration.
  * @class Middleware
  * @inherits Definition
  */
module.exports = function(MiddlewarePhase) {
  MiddlewarePhase.on('dataSourceAttached', function(eventData) {
    MiddlewarePhase.createModel = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const name = data.name;
      delete data.name;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      middlewareHandler.addPhase(workspace, name, data, cb);
    };
    MiddlewarePhase.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      middlewareHandler.findPhase(workspace, id, cb);
    };
    MiddlewarePhase.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      middlewareHandler.findPhase(workspace, id, cb);
    };
  });
};
