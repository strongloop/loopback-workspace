'use strict';
const Entity = require('./entity');
const fs = require('fs-extra');
const path = require('path');
const MiddlewarePhase = require('./middleware-phase');
const config = require('../config.json');

/**
 * @class Middleware
 *
 * Represents a Middleware in the Workspace graph.
 */

class Middleware extends Entity {
  constructor(Workspace, name, data) {
    super(Workspace, 'Middleware', name, data);
    this.contains(MiddlewarePhase, 'phases', 'ordered');
    let index = 0;
    config.middlewarePhases.forEach(function(phaseName) {
      let beforeMiddlewarePhase =
        new MiddlewarePhase(this, phaseName + ':before');
      this.insertSet(beforeMiddlewarePhase, index++);

      let middlewarePhase =
        new MiddlewarePhase(this, phaseName);
      this.insertSet(middlewarePhase, index++);

      let afterMiddlewarePhase =
        new MiddlewarePhase(this, phaseName + ':after');
      this.insertSet(afterMiddlewarePhase, index++);
    }, this);
  }
  setMiddlewarePhases(config) {
    const middleware = this;
    const workspace = this.getWorkspace();
    Object.keys(config).forEach(function(phaseName) {
      let phaseConfig = config[phaseName];
      let phase = middleware.phases(phaseName);
      if (phase) {
        phase.setMiddlewareConfigs(phaseConfig);
      } else {
        phase =
          new MiddlewarePhase(workspace, phaseName);
        phase.setMiddlewareConfigs(phaseConfig);
        middleware.add(phase);
      }
    });
  }
  read(facet, cb) {
    const workspace = facet.getWorkspace();
    const filePath = path.join(facet.filePath, this._name + '.json');
    fs.readJson(filePath, function(err, data) {
      if (err) return cb(err);
      facet.setMiddlewares(data);
      cb(null, data);
    });
  }
  write(workspace, facet, cb) {
    const data =
      facet.middlewares('middleware')
      .phases().map({json: true, filter: 'id', includeComponents: true});
    const filePath = path.join(facet.filePath, this._name + '.json');
    fs.mkdirp(path.dirname(filePath), function(err) {
      if (err) return cb(err);
      fs.writeJson(filePath, data, function(err) {
        if (err) return cb(err);
        cb();
      });
    });
  }
};

module.exports = Middleware;
