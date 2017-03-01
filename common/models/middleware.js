// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const clone = require('lodash').clone;
const middlewareHandler = require('../../lib/middleware-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Defines a `Middleware` configuration.
  * @class Middleware
  * @inherits Definition
  */
module.exports = function(Middleware) {
  Middleware.getPhase = function(data) {
    let phase = data.phase;
    if (data.subPhase) {
      phase = phase + ':' + data.subPhase;
    }
    return phase;
  };
  Middleware.getPhaseFromId = function(id) {
    const parts = id.split(':');
    if (parts.length > 1) {
      return parts[0] + (parts.length > 2 ? ':' + parts[1] : '');
    }
  };
  Middleware.getMiddlewarePath = function(id) {
    const parts = id.split(':');
    return parts.length > 1 ? parts.pop() : id;
  };
  Middleware.on('dataSourceAttached', function(eventData) {
    Middleware.createModel = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const phase = this.getPhase(data);
      const connector = Middleware.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const middlewareDef = clone(data);
      const middlewarePath = middlewareDef.function;
      delete middlewareDef.phase;
      delete middlewareDef.subPhase;
      workspace.Middleware.create(
        phase,
        middlewarePath,
        middlewareDef,
        function(err) {
          cb(err, data);
        });
    };
    Middleware.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const phaseName = Middleware.getPhaseFromId(filter.where.id);
      const middlewarePath = Middleware.getMiddlewarePath(filter.where.id);
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.Middleware.refresh(
      function findCallBack(err) {
        if (err) return cb(err);
        if (phaseName) {
          const phase = workspace.getMiddlewarePhase(phaseName);
          const middleware = phase.getMiddleware(middlewarePath);
          if (middleware) return cb(null, middleware.getConfig());
          return cb(new Error('middleware not found'));
        }
        const list = findMiddleware(workspace);
        cb(null, list);
      });
    };
    Middleware.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      if (filter.where) {
        return this.findById(filter, options, cb);
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      let phaseName, middlewarePath;
      if (filter.where) {
        phaseName = Middleware.getPhaseFromId(filter.where.id);
        middlewarePath = Middleware.getMiddlewarePath(filter.where.id);
      }
      workspace.Middleware.refresh(
      function findCallBack(err) {
        if (err) return cb(err);
        if (phaseName) {
          const phase = workspace.getMiddlewarePhase(phaseName);
          const middleware = phase.getMiddleware(middlewarePath);
          if (middleware) return cb(null, middleware.getConfig());
          return cb(new Error('middleware not found'));
        }
        const phases = workspace.getMiddlewareConfig();
        if (!phases) return cb(new Error('invalid configuration'));
        const list = findMiddleware(phases);
        cb(null, list);
      });
    };
  });
};

function findMiddleware(phases) {
  const list = [];
  Object.keys(phases).forEach(function(key) {
    let config = {};
    if (phases[key]) {
      Object.keys(phases[key]).forEach(function(m) {
        let middleware = phases[key][m];
        middleware.phase = key;
        list.push(middleware);
      });
    }
  });
  return list;
}
