'use strict';
const Workspace = require('./workspace.js');

/**
 * @class WorkspaceManager
 *
 * Creates and manages the Workspace graph.
 */
const Manager = class Manager {
  constructor() {
    //TODO(Deepak) - use Path to resolve directory
    this.createWorkspace('/');
    this.workspace.addDomain('ModelDefinition');
    this.workspace.addDomain('DataSource');
    this.workspace.addDomain('ModelProperty');
  }
  createWorkspace(dir) {
    this.workspace = new Workspace(dir);
  }
  getDirectory() {
    return this.workspace.directory;
  }
  getWorkspace() {
    return this.workspace;
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
