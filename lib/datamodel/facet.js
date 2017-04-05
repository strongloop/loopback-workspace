'use strict';

const async = require('async');
const config = require('../config.json');
const Entity = require('./entity');
const path = require('path');
const ModelConfig = require('./model-config');
const FacetConfig = require('./facet-config');
const Datasource = require('./datasource');
const MiddlewarePhase = require('./middleware-phase');
const Middleware = require('./middleware');
const fs = require('fs-extra');

/**
 * @class Facet
 *
 * Represents a Facet artifact in the Workspace graph.
 */
class Facet extends Entity {
  constructor(Workspace, name, data, options) {
    super(Workspace, 'Facet', name, data);
    this.contains(FacetConfig);
    this.contains(ModelConfig);
    this.contains(Datasource, 'datasources');
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
  getName() {
    return this._name;
  }
  getPath() {
    return path.join(this.getWorkspace().getDirectory(), this.getName());
  }
  getConfigPath() {
    const filePath = path.join(this.getWorkspace().getDirectory(),
      this.getName(),
      config.FacetConfigFile);
    return filePath;
  }
  get modelConfigPath() {
    const filePath = path.join(this.getWorkspace().getDirectory(),
      this.getName(),
      config.ModelConfigFile);
    return filePath;
  }
  get dataSourceConfigPath() {
    const workspace = this.getWorkspace();
    const filePath = path.join(workspace.directory, this.getName(),
      config.DataSourceConfigFile);
    return filePath;
  }
  addConfig(config) {
    const facetConfig =
      new FacetConfig(this.getWorkspace(), this._name, config);
    this.add(facetConfig);
  }
  write(cb) {
    const facet = this;
    const facetFolder = facet.getPath();
    const tasks = [];
    tasks.push(function(next) {
      fs.mkdirp(facetFolder, next);
    });
    tasks.push(function(next) {
      const facetConfig = new FacetConfig({}, 'id', {});
      facetConfig.write(facet, next);
    });
    tasks.push(function(next) {
      const modelConfig = new ModelConfig({}, 'id', {});
      modelConfig.write(facet, null, next);
    });
    async.series(tasks, cb);
  }
  setMiddlewareConfig(config) {
    const facet = this;
    const workspace = facet.getWorkspace();
    Object.keys(config).forEach(function(phaseName) {
      let phase = facet.phases(phaseName);
      if (phase) {
        let middlewareList = config[phaseName];
        Object.keys(middlewareList).forEach(function(middlewareName) {
          let middlewareConfig = middlewareList[middlewareName];
          let middleware = phase.middlewares(middlewareName);
          if (middleware) {
            middleware.setConfig(middlewareConfig);
          } else {
            middleware =
              new Middleware(workspace, middlewareName, middlewareConfig);
            phase.add(middleware);
          }
        });
      }
    });
  }
};

module.exports = Facet;
