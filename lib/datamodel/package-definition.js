'use strict';
const Entity = require('./entity');
const path = require('path');
const fs = require('fs-extra');

/**
 * @class PackageDefinition
 *
 * Represents a PackageDefinition artifact in the Workspace.
 */
class PackageDefinition extends Entity {
  constructor(Workspace, id, definition, options) {
    super(Workspace, 'PackageDefinition', id, definition);
  }
  getFilePath() {
    const filePath = path.join(this.getWorkspace().directory, 'package.json');
    return filePath;
  }
  getDefinition() {
    return this._content;
  }
  write(packageDef, cb) {
    const filePath = packageDef.getFilePath();
    const data = packageDef.getDefinition();
    fs.writeJson(filePath, data, cb);
  }
};

module.exports = PackageDefinition;
