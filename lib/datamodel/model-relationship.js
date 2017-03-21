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
    this.edge = new Edge(fromModel, toModel, options);
  }
  remove() {
    this.edge.remove();
    this._graph.deleteNode('ModelRelation', this._name);
  }
};

module.exports = ModelRelation;
