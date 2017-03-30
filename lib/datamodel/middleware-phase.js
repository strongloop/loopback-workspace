'use strict';
const Entity = require('./entity');
const Middleware = require('./middleware');

/**
 * @class MiddlewarePhase
 *
 * Represents a Middleware Phase artifact in the Workspace graph.
 */
class MiddlewarePhase extends Entity {
  constructor(Workspace, name) {
    super(Workspace, 'MiddlewarePhase', name, {});
    this.contains(Middleware, 'middlewares');
  }
};

module.exports = MiddlewarePhase;
