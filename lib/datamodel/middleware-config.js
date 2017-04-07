'use strict';
const Entity = require('./entity');
const fs = require('fs-extra');
const path = require('path');

/**
 * @class MiddlewareConfig
 *
 * Represents a MiddlewareConfig in the Workspace graph.
 */

class MiddlewareConfig extends Entity {
  constructor(Workspace, name, data) {
    super(Workspace, 'MiddlewareConfig', name, data);
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

module.exports = MiddlewareConfig;
