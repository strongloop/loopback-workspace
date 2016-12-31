'use strict';
const Edge = require('./graph').Edge;

/**
 * @class ModelRelation
 *
 * Represents a ModelProperty artifact in the Workspace graph.
 */
class ModelRelation extends Edge {
  constructor(id, fromModel, toModel, data) {
    super('ModelRelation', id, fromModel, toModel, data);
  }
};

module.exports = ModelRelation;
