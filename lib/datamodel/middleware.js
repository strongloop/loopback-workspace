'use strict';
const Entity = require('./entity');
const fs = require('fs-extra');
const path = require('path');

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
  read(workspace, cb) {
    const filePath = workspace.getMiddlewareFilePath();
    fs.readJson(filePath, function(err, data) {
      if (err) return cb(err);
      workspace.setMiddlewareConfig(data);
      cb(null, data);
    });
  }
  write(workspace, phaseArr, cb) {
    const data = workspace.getMiddlewareConfig();
    phaseArr.forEach(function(phaseName) {
      data[phaseName] = {};
    });
    const file = workspace.getMiddlewareFilePath();
    fs.mkdirp(path.dirname(file), function(err) {
      if (err) return cb(err);
      fs.writeJson(file, data, function(err) {
        if (err) return cb(err);
        cb();
      });
    });
  }
};

module.exports = Middleware;
