'use strict';
const config = require('./config.json');
const Workspace = require('./workspace.js');
const templateRegistry = require('./template-registry');
/**
 * @class WorkspaceManager
 *
 * Creates and manages the Workspace graph.
 */
const Manager = class Manager {
  constructor() {
    this.listOfWorkspaces = {};
    this.index = 0;
    this.folderMap = {};
  }
  createWorkspace(dir) {
    if (this.folderMap[dir] && this.listOfWorkspaces[this.folderMap[dir]]) {
      return this.listOfWorkspaces[this.folderMap[dir]];
    }
    const workspace = new Workspace(dir);
    workspace.addDomain('Facet');
    workspace.addDomain('FacetConfig');
    workspace.addDomain('DataSource');
    workspace.addDomain('MiddlewarePhase');
    workspace.addDomain('Middleware');
    workspace.addDomain('ModelConfig');
    workspace.addDomain('ModelDefinition');
    workspace.addDomain('ModelProperty');
    workspace.addDomain('ModelMethod');
    workspace.addDomain('ModelRelation');
    workspace.addDomain('PackageDefinition');
    this.initMiddleware(workspace);
    workspace.addBuiltInModels(config.builtInModels);
    workspace.setId(this.getWorkspaceId());
    this.listOfWorkspaces[workspace.getId()] = workspace;
    this.folderMap[dir] = workspace.getId();
    if (this.index === 1) this.defaultWorkspace = workspace;
    return workspace;
  }
  getWorkspaceId() {
    this.index++;
    const prefix = '0000';
    let id = '' + this.index;
    return prefix.substring(0, (prefix.length - id.length)).concat(id);
  }
  getWorkspace(id) {
    return id ? this.listOfWorkspaces[id] : this.defaultWorkspace;
  }
  getWorkspaceByFolder(dir) {
    if (this.folderMap[dir]) return this.listOfWorkspaces[this.folderMap[dir]];
  }
  deleteWorkspace(id) {
    if (this.listOfWorkspaces[id]) {
      const dir = this.listOfWorkspaces[id].getDirectory();
      delete this.folderMap[dir];
      delete this.listOfWorkspaces[id];
    }
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
  getTemplate(name) {
    return templateRegistry.getTemplate(name);
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
