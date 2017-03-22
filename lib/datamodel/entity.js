'use strict';
const clone = require('lodash').clone;
const Node = require('./graph').Node;

/**
 * @class Entity
 *
 * Abstract of all artifacts in the Workspace graph.
 */
class Entity extends Node {
  constructor(Workspace, domain, id, data) {
    super(Workspace, domain, id, data);
    this.getWorkspace = function() {
      return Workspace;
    };
  }
  set(config) {
    const data = this._content;
    Object.keys(config).forEach(function(key) {
      data[key] = config[key];
    });
  }
  getDefinition() {
    return this._content;
  }
  static registerAction(action, handler) {
    Entity.prototype[action] = Entity.wrapHandler(handler);
  }
  static wrapHandler(handler) {
    return function() {
      const self = this;
      const workspace = this.getWorkspace();
      const args = Array.prototype.slice.call(arguments);
      const cb = args.pop();
      const method = function(next) {
        args.push(next);
        handler.apply(self, args);
      };
      const tasks = [];
      tasks.push(method);
      workspace.execute(tasks, cb);
    };
  }
}

module.exports = Entity;
