'use strict';
const config = require('../config.json');
const Entity = require('./entity');
const path = require('path');
const ModelConfig = require('./model-config');
const FacetConfig = require('./facet-config');
const Datasource = require('./datasource');

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
  }
  getName() {
    return this._name;
  }
  getPath() {
    return path.join(this.getWorkspace().getDirectory(), this._name);
  }
  getConfigPath() {
    const filePath = path.join(this.getWorkspace().getDirectory(), this._name,
      this.getWorkspace().getConfig().FacetConfigFile);
    return filePath;
  }
  getModelConfigPath() {
    const filePath = path.join(this.getWorkspace().getDirectory(), this._name,
      this.getWorkspace().getConfig().ModelConfigFile);
    return filePath;
  }
  setModelConfig(modelName, config) {
    let workspace = this.getWorkspace();
    if (workspace.model('common.models.' + modelName)) {
      let modelConfig =
        new ModelConfig(workspace, 'common.models.' + modelName, config);
      this.add(modelConfig);
    } else {
      let modelConfig =
        new ModelConfig(workspace, modelName, config);
      this.add(modelConfig);
    }
  }
  getConfig() {
    const facetNodes = this.facetconfig().nodes;
    let config = {};
    if (facetNodes) {
      Object.keys(facetNodes).forEach(function(key) {
        let facetConfig = facetNodes[key];
        if (facetConfig && facetConfig.getContents()) {
          config = facetConfig.getContents();
        }
      });
    }
    return config;
  }
  addConfig(config) {
    const facetConfig =
      new FacetConfig(this.getWorkspace(), this._name, config);
    this.add(facetConfig);
  }
  getDataSourceConfigFilePath() {
    const workspace = this.getWorkspace();
    const filePath = path.join(workspace.directory, this._name,
      config.DataSourceConfigFile);
    return filePath;
  }
};

module.exports = Facet;
