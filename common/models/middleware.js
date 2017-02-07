// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
/**
  * Defines a `Middleware` configuration.
  * @class Middleware
  * @inherits Definition
  */
module.exports = function(Middleware) {
  Middleware.getPhase = function(data) {
    const phase = data.phase;
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
    Middleware.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const phase = this.getPhase(data);
      const connector = Middleware.getConnector();
      // TODO(Deepak) - add response handling later
      connector.createMiddleware(options.workspaceId, phase, data, cb);
    };
    Middleware.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const phase = Middleware.getPhaseFromId(filter.where.id);
      const middlewarePath = Middleware.getMiddlewarePath(filter.where.id);
      const connector = Middleware.getConnector();
      connector.findMiddleware(
        options.workspaceId,
        phase,
        middlewarePath,
        cb);
    };
  });
};
