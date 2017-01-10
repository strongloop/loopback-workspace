'use strict';
const app = require('../server/server.js');
const connector = app.dataSources.db.connector;
const clone = require('lodash').clone;
const DataSourceHandler = require('./data-source-handler');
const FacetHandler = require('./facet-handler');
const MiddlewareHandler = require('./middleware-handler');
const ModelHandler = require('./model-handler');
const RelationsHandler = require('./relation-handler');
const TemplateHandler = require('./template-handler');
const WorkspaceManager = require('../component/workspace-manager.js');

/**
 * @class Connector
 *
 * performs CRUD operations on the Workspace graph.
 */

connector.createFromTemplate = function(template, destinationFolder, cb) {
  const workspace = WorkspaceManager.createWorkspace(destinationFolder);
  TemplateHandler.createFromTemplate(workspace, template, cb);
};

connector.createFacet = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  FacetHandler.createFacet(workspace, id, data, cb);
};

connector.createModel = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.createModel(workspace, id, data, cb);
};

connector.createModelConfig = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  const modelConfig = clone(data);
  delete modelConfig.id;
  ModelHandler.createModelConfig(workspace, id, modelConfig, cb);
};

connector.createDataSource = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  DataSourceHandler.createDataSource(workspace, id, data, cb);
};

connector.createModelProperty = function(modelId, propertyName, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  workspace.addModelProperty(modelId, propertyName, data, cb);
};

connector.createModelRelation = function(fromModelId, toModelId, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  const relationDef = clone(data);
  const relationName = relationDef.id;
  delete relationDef.id;
  RelationsHandler.createRelation(
      workspace, relationName, fromModelId, toModelId, relationDef, cb);
};

connector.createMiddleware = function(phase, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  const middlewareDef = clone(data);
  const middlewarePath = middlewareDef.function;
  delete middlewareDef.phase;
  delete middlewareDef.subPhase;
  MiddlewareHandler.createMiddleware(
  workspace,
  phase,
  middlewarePath,
  middlewareDef,
  cb);
};

connector.createModel = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.createModel(workspace, id, data, cb);
};

connector.createModelConfig = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  const modelConfig = clone(data);
  delete modelConfig.id;
  ModelHandler.createModelConfig(workspace, id, modelConfig, cb);
};

connector.createDataSource = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  DataSourceHandler.createDataSource(workspace, id, data, cb);
};

connector.findModel = function(id, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.findModel(workspace, id, cb);
};

connector.findModelConfig = function(id, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.findModelConfig(workspace, id, cb);
};

connector.findDataSource = function(id, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  DataSourceHandler.findDataSource(workspace, id, cb);
};

connector.findMiddleware = function(phase, name, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  MiddlewareHandler.findMiddleware(workspace, phase, name, cb);
};

connector.updateDataSource = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  DataSourceHandler.updateDataSource(workspace, id, data, cb);
};

connector.updateModel = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.updateModel(workspace, id, data, cb);
};

connector.updateModelConfig = function(id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace();
  ModelHandler.updateModelConfig(workspace, id, data.facetName, data, cb);
};
