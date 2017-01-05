'use strict';
const Node = require('./graph').Node;
const path = require('path');
const ModelConfig = require('./model-config');
/**
 * @class Facet
 *
 * Represents a Facet artifact in the Workspace graph.
 */
class Facet extends Node {
  constructor(Workspace, name, data, options) {
    super(Workspace, 'Facet', name, data);
    //Facet adds itself to the workspace
    Workspace.addNode(this);
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
  getModelConfig() {
    const modelConfigNodes = this._graph._cache['ModelConfig'];
    const config = {};
    Object.keys(modelConfigNodes).forEach(function(key) {
      const modelId = key.split('.');
      if (modelId.length && modelId.length > 1) {
        const modelName = modelId[1];
        config[modelName] = modelConfigNodes[key]._content;
      }
    });
    return config;
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
