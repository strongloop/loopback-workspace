'use strict';
const Relation = require('../datamodel/relation');

/**
 * @class ModelConfig
 *
 * Represents a ModelConfig artifact in the Workspace graph.
 */
class ModelConfig extends Relation {
  constructor(workspace, id, data) {
    super(workspace, 'ModelRelation', id, data);
  }
  getDefinition() {
    return this.data;
  }
};

module.exports = ModelConfig;
