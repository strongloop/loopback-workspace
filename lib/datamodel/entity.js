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
}

module.exports = Entity;
