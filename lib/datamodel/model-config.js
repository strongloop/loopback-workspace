'use strict';
const Entity = require('./entity');
const Edge = require('./graph').Edge;

/**
 * @class ModelConfig
 *
 * Represents a ModelConfig artifact in the Workspace graph.
 */
class ModelConfig extends Entity {
  constructor(Workspace, modelId, data, options) {
    super(Workspace, 'ModelConfig', modelId, data);
    // ModelConfig adds itself to the workspace
    Workspace.addNode(this);
    const model = Workspace.model(modelId);
    new Edge(this, model);
  }
  getDefinition() {
    return this._content;
  }
};

module.exports = ModelConfig;
