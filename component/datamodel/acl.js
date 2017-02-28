'use strict';
const Entity = require('./entity');

/**
 * @class Acl
 *
 * Represents a Access Control artifact in the Workspace graph.
 */
class Acl extends Entity {
  constructor(Workspace, id, data, options) {
    super(Workspace, 'ModelAccessControl', id, data);
    Workspace.addNode(this);
    this.accessControlList = [];
  }
  getDefinition() {
    return this.accessControlList;
  }
  addConfig(index, data) {
    this.accessControlList.splice(index, 0, data);
  }
};

module.exports = Acl;
