'use strict';
const Entity = require('./entity');

/**
 * @class ModelMethod
 *
 * Represents a ModelMethod artifact in the Workspace graph.
 */
class ModelMethod extends Entity {
  constructor(Workspace, id, methodDef, options) {
    super(Workspace, 'ModelMethod', id, methodDef);
  }
};

module.exports = ModelMethod;
