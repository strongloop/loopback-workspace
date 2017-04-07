// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const clone = require('lodash').clone;
const MiddlewareClass = require('../../lib/datamodel/middleware');
const WorkspaceManager = require('../../lib/workspace-manager.js');
const MiddlewareConfig = require('../../lib/datamodel/middleware-config');

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
      const facetName = data.facetName;
      const phaseName = this.getPhase(data);
      const connector = Middleware.getConnector();
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const facet = workspace.facets(facetName);
      const middleware = facet.middlewares('middleware');
      const phase = middleware.phases(phaseName);
      const middlewareDef = clone(data);
      const middlewarePath = middlewareDef.function;
      delete middlewareDef.phase;
      delete middlewareDef.subPhase;
      const middlewareConfig =
        new MiddlewareConfig(workspace, middlewarePath, middlewareDef);
      phase.add(middlewareConfig);
      middleware.execute(
      middleware.create.bind(middleware, workspace, facet),
      function(err) {
        cb(err, data);
      });
    };
    Middleware.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const phaseName = Middleware.getPhaseFromId(filter.where.id);
      const middlewarePath = Middleware.getMiddlewarePath(filter.where.id);
      const facetName = filter.where.facetName;
      const middleware = workspace.facets(facetName).middlewares('middleware');
      middleware.execute(
      middleware.refresh.bind(middleware, facetName), function(err) {
        const phase = middleware.phases(phaseName);
        if (phase) {
          const middleware = phase.config(middlewarePath);
          if (middleware) {
            return cb(null, middleware.getConfig());
          }
        } else {
          return cb(new Error('phase not found'));
        }
        return cb(new Error('middleware not found'));
      });
    };
    Middleware.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      if (filter.where && filter.where.id) {
        return this.findById(filter, options, cb);
      }
      const facetName = filter.where && filter.where.facetName || 'server';
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const middleware = workspace.facets(facetName).middlewares('middleware');
      middleware.execute(
      middleware.refresh.bind(middleware, facetName), function(err) {
        if (err) return cb(err);
        const facet = workspace.facets('server');
        const list = facet.middlewares('middleware')
          .phases().map({includeComponents: true});
        cb(null, list);
      });
    };
  });
};
