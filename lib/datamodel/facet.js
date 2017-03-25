'use strict';
const config = require('../config.json');
const Entity = require('./entity');
const path = require('path');
const ModelConfig = require('./model-config');
const FacetConfig = require('./facet-config');

/**
 * @class Facet
 *
 * Represents a Facet artifact in the Workspace graph.
 */
class Facet extends Entity {
  constructor(Workspace, name, data, options) {
    super(Workspace, 'Facet', name, data);
    // Facet adds itself to the workspace
    Workspace.addNode(this);
    this.contains(FacetConfig);
    this.contains(ModelConfig);
  }
  getName() {
    return this._name;
  }
  getPath() {
    return path.join(this._graph.getDirectory(), this._name);
  }
  getConfigPath() {
    const filePath = path.join(this._graph.getDirectory(), this._name,
      this._graph.getConfig().FacetConfigFile);
    return filePath;
  }
  getModelConfigPath() {
    const filePath = path.join(this._graph.getDirectory(), this._name,
      this._graph.getConfig().ModelConfigFile);
    return filePath;
  }
  setModelConfig(modelName, config) {
    let workspace = this.getWorkspace();
    if (workspace.model('common.models.' + modelName)) {
      let modelConfig = new ModelConfig(workspace, 'common.models.' + modelName, config);
      this.add(modelConfig);
    } else {
      let modelConfig =
        new ModelConfig(workspace, modelName, config);
      facet.add(modelConfig);
    }
  }
  getModelConfig(modelId) {
    const modelConfigNodes = this.modelconfig();
    const modelConfig = {};
    if (modelConfigNodes) {
      Object.keys(modelConfigNodes).forEach(function(key) {
        let parts = key.split('.');
        let modelName = parts[parts.length - 1];
        modelConfig[modelName] = modelConfigNodes[key]._content;
      });
    }
    if (modelId) {
      const parts = modelId.split('.');
      const modelName = parts[parts.length - 1];
      return modelConfig[modelName];
    } else {
      modelConfig._meta = config.modelsMetadata;
      return modelConfig;
    }
  }
  getConfig() {
    const facetNodes = this.facetconfig();
    let config = {};
    if (facetNodes) {
      Object.keys(facetNodes).forEach(function(key) {
        let facetConfig = facetNodes[key];
        if (facetConfig && facetConfig.getDefinition()) {
          config = facetConfig.getDefinition();
        }
      });
    }
    return config;
  }
  addConfig(config) {
    const facetConfig = new FacetConfig(this._graph, this._name, config);
    this.addContainsRelation(facetConfig);
  }
};

module.exports = Facet;
