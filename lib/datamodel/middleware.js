'use strict';
const Entity = require('./entity');

/**
 * @class Middleware
 *
 * Represents a Middleware in the Workspace graph.
 */
class Middleware extends Entity {
  constructor(Workspace, name, data) {
    super(Workspace, 'Middleware', name, data);
  }
  getFunction() {
    return this._content['function'];
  }
  getConfig() {
    return this._content;
  }
  setConfig(config) {
    this._content = config;
  }
};

module.exports = Middleware;
