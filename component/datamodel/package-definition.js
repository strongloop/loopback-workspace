'use strict';
const Node = require('./graph').Node;
const path = require('path');

/**
 * @class PackageDefinition
 *
 * Represents a PackageDefinition artifact in the Workspace.
 */
class PackageDefinition extends Node {
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
