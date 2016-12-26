'use strict';
const Workspace = require('./workspace.js');

/**
 * @class WorkspaceManager
 *
 * Creates and manages the Workspace graph.
 */
const Manager = class Manager {
  constructor() {
  }
  createWorkspace(dir) {
    this.workspace = new Workspace(dir);
    this.workspace.addDomain('ModelDefinition');
    this.workspace.addDomain('DataSource');
    this.workspace.addDomain('ModelProperty');
  }
  getWorkspace() {
    return this.workspace;
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
