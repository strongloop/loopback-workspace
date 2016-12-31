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
    if (this.workspace && this.workspace.getDirectory() === dir) {
      return;
    }
    this.workspace = new Workspace(dir);
    this.workspace.addDomain('DataSource');
    this.workspace.addDomain('MiddlewarePhase');
    this.workspace.addDomain('Middleware');
    this.workspace.addDomain('ModelDefinition');
    this.workspace.addDomain('ModelProperty');
    this.workspace.addDomain('ModelRelation');
    this.initMiddleware(this.workspace);
  }
  getWorkspace() {
    return this.workspace;
  }
  initMiddleware(workspace) {
    workspace.addMiddlewarePhase('initial');
    workspace.addMiddlewarePhase('session');
    workspace.addMiddlewarePhase('auth');
    workspace.addMiddlewarePhase('parse');
    workspace.addMiddlewarePhase('routes');
    workspace.addMiddlewarePhase('files');
    workspace.addMiddlewarePhase('final');
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
