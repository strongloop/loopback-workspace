'use strict';
const Entity = require('./entity');

/**
 * @class DataSource
 *
 * Represents a DataSource artifact in the Workspace graph.
 */
class DataSource extends Entity {
  constructor(Workspace, id, datasource, options) {
    super(Workspace, 'DataSource', id, datasource);
    this.options = options;
    Workspace.addNode(this);
  }
  getDefinition() {
    return this._content;
  }
};

module.exports = DataSource;
