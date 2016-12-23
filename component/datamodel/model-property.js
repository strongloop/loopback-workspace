'use strict';
const Node = require('./graph').Node;

/**
 * @class ModelProperty
 *
 * Represents a ModelProperty artifact in the Workspace graph.
 */
class ModelProperty extends Node {
  constructor(Workspace, id, propertyDef, options) {
    super(Workspace, 'ModelProperty', id, propertyDef);
    //ModelProperty adds itself to the workspace
    Workspace.addNode(this);
  }
};

module.exports = ModelProperty;
