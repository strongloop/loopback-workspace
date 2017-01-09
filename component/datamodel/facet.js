'use strict';
const Entity = require('./entity');
const path = require('path');
const ModelConfig = require('./model-config');
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
  }
  getName() {
    return this._name;
  }
  addModelConfig(workspace, modelId, config) {
    const modelConfig = new ModelConfig(workspace, modelId, config);
    this.addContainsRelation(modelConfig);
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
  setModelConfig(config) {
    const modelConfigNodes = this.getContainedSet('ModelConfig');
    if (modelConfigNodes) {
      Object.keys(modelConfigNodes).forEach(function(key) {
        modelConfigNodes[key]._content = config[key];
      });
    }
  }
  getModelConfig(id) {
    const modelConfigNodes = this.getContainedSet('ModelConfig');
    const config = {};
    if (modelConfigNodes) {
      Object.keys(modelConfigNodes).forEach(function(key) {
        config[key] = modelConfigNodes[key]._content;
      });
    }
    if (id) return config[id];
    else return config;
  }
  getConfig() {
    const facetNodes = this._graph._cache['FacetConfig'];
    const config = {};
    Object.keys(facetNodes).forEach(function(key) {
      let facetConfig = facetNodes[key];
      if (facetConfig && facetConfig.getDefinition()) {
        config = facetConfig.getDefinition();
      }
    });
    return config;
  }
};

module.exports = Facet;
