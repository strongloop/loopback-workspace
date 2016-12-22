'use strict';
var Node = require('./graph').Node;

/**
 * @class DataSource
 *
 * Represents a DataSource artifact in the Workspace graph.
 */
class DataSource extends Node {
  constructor(Workspace, id, datasource, options) {
    super(Workspace, 'DataSource', id, datasource);
    this.options = options;
    Workspace.addNode(this);
  }
};

module.exports = DataSource;
