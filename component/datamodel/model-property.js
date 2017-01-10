'use strict';
const Entity = require('./entity');

/**
 * @class ModelProperty
 *
 * Represents a ModelProperty artifact in the Workspace graph.
 */
class ModelProperty extends Entity {
  constructor(Workspace, id, propertyDef, options) {
    super(Workspace, 'ModelProperty', id, propertyDef);
    // ModelProperty adds itself to the workspace
    Workspace.addNode(this);
  }
};

module.exports = ModelProperty;
