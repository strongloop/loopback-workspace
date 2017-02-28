'use strict';
const Edge = require('./graph').Edge;
const Entity = require('./entity');

/**
 * @class ModelRelation
 *
 * Represents a ModelRelation artifact in the Workspace graph.
 */
class ModelRelation extends Entity {
  constructor(Workspace, id, data, fromModel, toModel, options) {
    super(Workspace, 'ModelRelation', id, data);
    // ModelRelation adds itself to the workspace
    Workspace.addNode(this);
    new Edge(fromModel, toModel, options);
  }
};

module.exports = ModelRelation;
