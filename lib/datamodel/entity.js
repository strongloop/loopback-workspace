'use strict';
const clone = require('lodash').clone;
const Composite = require('./graph').Composite;
const fs = require('fs-extra');

/**
 * @class Entity
 *
 * Abstract of all artifacts in the Workspace graph.
 */
class Entity extends Composite {
  constructor(Workspace, domain, id, data) {
    super(domain, id, data);
    this.getWorkspace = function() {
      return Workspace;
    };
  }
  remove() {
    const name = this._name;
    return this.getWorkspace().deleteNode(this._domain, name);
  }
  update(config, filter) {
    if (!config || typeof config !== 'object')
      throw new Error('invalid config passed');
    if (filter && typeof filter === 'string') {
      filter = [filter];
    }
    if (!filter) {
      filter = [];
    }
    config = clone(config);
    filter.forEach(function(fieldName) {
      delete config[fieldName];
    });
    this.set(config);
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
