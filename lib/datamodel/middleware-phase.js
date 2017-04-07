'use strict';
const Entity = require('./entity');
const MiddlewareConfig = require('./middleware-config');
const fs = require('fs-extra');

/**
 * @class MiddlewarePhase
 *
 * Represents a Middleware Phase artifact in the Workspace graph.
 */
class MiddlewarePhase extends Entity {
  constructor(Workspace, name) {
    super(Workspace, 'MiddlewarePhase', name, {});
    this.contains(MiddlewareConfig, 'config');
  }
  setMiddlewareConfigs(middlewareList) {
    const workspace = this.getWorkspace();
    const phase = this;
    Object.keys(middlewareList).forEach(function(middlewareName) {
      let middlewareConfig = middlewareList[middlewareName];
      let middleware = phase.config(middlewareName);
      if (middleware) {
        middleware.setConfig(middlewareConfig);
      } else {
        middleware =
          new MiddlewareConfig(workspace, middlewareName, middlewareConfig);
        middleware.setConfig(middlewareConfig);
        phase.add(middleware);
      }
    });
  }
};

module.exports = MiddlewarePhase;
