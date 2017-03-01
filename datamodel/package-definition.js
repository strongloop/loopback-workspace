'use strict';
const Entity = require('./entity');
const path = require('path');

/**
 * @class PackageDefinition
 *
 * Represents a PackageDefinition artifact in the Workspace.
 */
class PackageDefinition extends Entity {
  constructor(Workspace, id, definition, options) {
    super(Workspace, 'PackageDefinition', id, definition);
    Workspace.addNode(this);
  }
  getFilePath() {
    const filePath = path.join(this._graph.directory, 'package.json');
    return filePath;
  }
  getDefinition() {
    return this._content;
  }
};

module.exports = PackageDefinition;
