'use strict';
var Node = require('./graph').Node;

/**
 * @class Model
 *
 * Represents a Model artifact in the Workspace graph.
 */
class Model extends Node {
  constructor(Workspace, id, modelDef, options) {
    super(Workspace, 'ModelDefinition', id, modelDef);
    this.properties = {};
    this.methods = {};
    this.relations = {};
    this.config = {};
    this.options = options;
    Workspace.addNode(this);
  }
};

module.exports = Model;
