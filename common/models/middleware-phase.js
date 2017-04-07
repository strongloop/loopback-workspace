// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Phase = require('../../lib/datamodel/middleware-phase');
const Middleware = require('../../lib/datamodel/middleware');
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
      const phaseName = data.name;
      const facetName = data.facetName;
      let index = data.index;
      if (!index || typeof index !== 'number')
        index = -1;
      delete data.name;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const facet = workspace.facets(facetName);
      const middleware = facet.middleware('middleware');
      if (!facet)
        return cb(new Error('invalid facet name'));
      const phase = middleware.phases(phaseName);
      if (phase)
        return cb(new Error('phase exists already'));
      let beforePhase  = new Phase(workspace, phaseName + ':before');
      let middlewarephase  = new Phase(workspace, phaseName);
      let afterPhase  = new Phase(workspace, phaseName + ':after');
      middleware.add(beforePhase, index++, before);
      middleware.add(middlewarephase, index++, before);
      middleware.add(afterPhase, index++, before);
      middleware.execute(
      middleware.create.bind(middleware, workspace, facet), cb);
    };
    MiddlewarePhase.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const facetName = filter.where && filter.where.facetName || 'server';
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const middleware = workspace.facets(facetName).middleware('middleware');
      middleware.execute(
      middleware.refresh.bind(middleware, facetName),
      function(err, results) {
        if (err) return cb(err);
        const phase = middleware.phases(id);
        const config = phase.config(id);
        if (config) return cb(null, config);
        cb(new Error('middleware not found'));
      });
    };
    MiddlewarePhase.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where && filter.where.id;
      const facetName = filter.where && filter.where.facetName || 'server';
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const middleware = workspace.facets(facetName).middleware('middleware');
      middleware.execute(
      middleware.refresh.bind(middleware, facetName),
      function(err, results) {
        if (err) return cb(err);
        const phase = middleware.phases(id);
        const config = phase.config(id);
        if (config) return cb(null, config);
        cb(new Error('middleware not found'));
      });
    };
  });
};
