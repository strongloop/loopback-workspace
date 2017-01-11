'use strict';
const Edge = require('./graph').Edge;
const Node = require('./graph').Node;

/**
 * @class ModelRelation
 *
 * Represents a ModelRelation artifact in the Workspace graph.
 */
class ModelRelation extends Node {
  constructor(Workspace, id, data, fromModel, toModel, options) {
    super(Workspace, 'ModelRelation', id, data);
    // ModelRelation adds itself to the workspace
    Workspace.addNode(this);
    new Edge(fromModel, toModel, options);
  }
};

module.exports = ModelRelation;
