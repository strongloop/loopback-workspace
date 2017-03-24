'use strict';
const clone = require('lodash').clone;
const Composite = require('./graph').Composite;

/**
 * @class Entity
 *
 * Abstract of all artifacts in the Workspace graph.
 */
class Entity extends Composite {
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
  execute(fn, cb) {
    const self = this;
    const workspace = this.getWorkspace();
    const tasks = [];
    tasks.push(fn);
    workspace.execute(tasks, cb);
  };
}

module.exports = Entity;
