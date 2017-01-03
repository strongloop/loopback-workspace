'use strict';
const Node = require('./graph').Node;
const Edge = require('./graph').Edge;

/**
 * @class ModelConfig
 *
 * Represents a ModelConfig artifact in the Workspace graph.
 */
class ModelConfig extends Node {
  constructor(Workspace, modelId, data, options) {
    super(Workspace, 'ModelConfig', modelId, data);
    //ModelConfig adds itself to the workspace
    Workspace.addNode(this);
    const model = Workspace.getModel(modelId);
    new Edge(this, model);
  }
};

module.exports = ModelConfig;
