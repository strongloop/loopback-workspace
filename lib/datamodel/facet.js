'use strict';

const async = require('async');
const config = require('../config.json');
const Entity = require('./entity');
const path = require('path');
const ModelConfig = require('./model-config');
const FacetConfig = require('./facet-config');
const Datasource = require('./datasource');
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
    this.contains(Middleware, 'middlewares');
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
  setMiddlewares(config) {
    let middleware = this.middlewares('middleware');
    middleware.setMiddlewarePhases(config);
  }
  get filePath() {
    return path.join(this.getWorkspace().getDirectory(), this._name);
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
};

module.exports = Facet;
