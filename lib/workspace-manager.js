'use strict';
const config = require('./config.json');
const Workspace = require('./workspace');
const templateRegistry = require('./template-registry');
const dataSourceActions = require('./actions/datasource');
const facetActions = require('./actions/facet');
const loadActions = require('./actions/load');
const middlewareActions = require('./actions/middleware');
const modelActions = require('./actions/model');
const modelConfigActions = require('./actions/model-config');
const modelPropertyActions = require('./actions/model-property');
const modelRelationActions = require('./actions/model-relation');
const packageDefinitionActions = require('./actions/package-definition');
const templateActions = require('./actions/template');

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
  clearAllWorkspaces() {
    this.listOfWorkspaces = {};
    this.index = 0;
    this.folderMap = {};
  }
  getTemplate(name) {
    return templateRegistry.getTemplate(name);
  }
};

const WorkspaceManager = new Manager();

module.exports = WorkspaceManager;
