'use strict';
const Node = require('./graph').Node;
const Middleware = require('./middleware');
/**
 * @class MiddlewarePhase
 *
 * Represents a Middleware Phase artifact in the Workspace graph.
 */
class MiddlewarePhase extends Node {
  constructor(Workspace, name) {
    super(Workspace, 'MiddlewarePhase', name, {});
    Workspace.addNode(this);
  }
  addMiddleware(workspace, path, middlewareDef) {
    const middleware = new Middleware(workspace, path, middlewareDef);
    this.addContainsRelation(middleware);
  }
  getMiddlewareList() {
    const contains = this._contains;
    const middlewareList = {};
    if (contains['Middleware']) {
      const middlewares = contains['Middleware'];
      Object.keys(middlewares).forEach(function(key) {
        const pointer = middlewares[key];
        middlewareList[pointer._name] = pointer.getNode();
      });
      return middlewareList;
    }
    return {};
  }
  getMiddleware(middlewarePath) {
    const contains = this._contains;
    const middlewares = this._contains.Middleware;
    const pointer = middlewares && middlewares[middlewarePath];
    return pointer && pointer.getNode();
  }
};

module.exports = MiddlewarePhase;
