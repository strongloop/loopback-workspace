// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const middlewareHandler = require('../../connector/middleware-handler');

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
      middlewareHandler.addPhase(options.workspaceId, name, data, cb);
    };
    MiddlewarePhase.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      middlewareHandler.findPhase(options.workspaceId, id, cb);
    };
  });
};
