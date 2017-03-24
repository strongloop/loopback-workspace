// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Phase = require('../../lib/datamodel/middleware-phase');
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
      const phase = new Phase(workspace, name);
      phase.execute(
      phase.create.bind(phase, name, data.index, data.before), cb);
    };
    MiddlewarePhase.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const phase = new Phase(workspace, id);
      phase.execute(phase.refresh.bind(phase), function(err, results) {
        if (err) return cb(err);
        const phase = workspace.getMiddlewarePhase(id);
        const middleware = phase.getMiddlewareList();
        if (middleware) return cb(null, middleware);
        cb(new Error('middleware not found'));
      });
    };
    MiddlewarePhase.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const phase = new Phase(workspace, id);
      phase.execute(phase.refresh.bind(phase), function(err, results) {
        if (err) return cb(err);
        const phase = workspace.getMiddlewarePhase(id);
        const middleware = phase.getMiddlewareList();
        if (middleware) return cb(null, middleware);
        cb(new Error('middleware not found'));
      });
    };
  });
};
