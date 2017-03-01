'use strict';
const config = require('./config.json');
const Workspace = require('./workspace');
const templateRegistry = require('./template-registry');
const facetHandler = require('./facet-handler');
const dataSourceHandler = require('./data-source-handler');
const middlewareHandler = require('./middleware-handler');
const modelHandler = require('./model-handler');

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
    facetHandler(workspace);
    dataSourceHandler(workspace);
    middlewareHandler(workspace);
    modelHandler(workspace);
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
    workspace.setMiddlewarePhase('initial');
    workspace.setMiddlewarePhase('session');
    workspace.setMiddlewarePhase('auth');
    workspace.setMiddlewarePhase('parse');
    workspace.setMiddlewarePhase('routes');
    workspace.setMiddlewarePhase('files');
    workspace.setMiddlewarePhase('final');
  }
  getTemplate(name) {
    return templateRegistry.getTemplate(name);
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
