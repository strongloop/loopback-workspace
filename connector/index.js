'use strict';
const app = require('../server/server.js');
const connector = app.dataSources.db.connector;
const clone = require('lodash').clone;
const DataSourceHandler = require('./data-source-handler');
const FacetHandler = require('./facet-handler');
const MiddlewareHandler = require('./middleware-handler');
const ModelAccessHandler = require('./model-access-handler');
const ModelHandler = require('./model-handler');
const RelationsHandler = require('./relation-handler');
const TemplateHandler = require('./template-handler');
const WorkspaceHandler = require('./workspace-handler');
const WorkspaceManager = require('../component/workspace-manager.js');

/**
 * @class Connector
 *
 * performs CRUD operations on the Workspace graph.
 */
connector.all = function(modelName, filter, options, cb) {
  const model = app.models[modelName];
  model.all(filter, options, cb);
};

connector.create = function(modelName, data, options, cb) {
  const model = app.models[modelName];
  model.createModel(data, options, cb);
};

connector.save = function(modelName, data, options, cb) {
  const model = app.models[modelName];
  model.create(data, options, cb);
};

connector.createFromTemplate = function(template, destinationFolder, cb) {
  const workspace = WorkspaceManager.createWorkspace(destinationFolder);
  TemplateHandler.createFromTemplate(workspace, template, cb);
};

connector.loadWorkspace = function(workspaceFolder, cb) {
  const workspace = WorkspaceManager.createWorkspace(workspaceFolder);
  WorkspaceHandler.loadWorkspace(workspace, cb);
};

connector.createFacet = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  FacetHandler.createFacet(workspace, id, data, cb);
};

connector.createModel = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.createModel(workspace, id, data, cb);
};

connector.createModelConfig =
function(workspaceId, id, facetName, modelConfig, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.createModelConfig(workspace, id, facetName, modelConfig, cb);
};

connector.createDataSource = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  DataSourceHandler.createDataSource(workspace, id, data, cb);
};

connector.createModelProperty =
function(workspaceId, modelId, propertyName, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.createModelProperty(workspace, modelId, propertyName, data, cb);
};

connector.createModelMethod =
function(workspaceId, modelId, name, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.createModelMethod(workspace, modelId, name, data, cb);
};

connector.findModelProperty =
function(workspaceId, modelId, propertyName, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.findModelProperty(workspace, modelId, propertyName, cb);
};

connector.createModelRelation =
function(workspaceId, fromModelId, toModelId, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  const relationDef = clone(data);
  const relationName = relationDef.id;
  delete relationDef.id;
  RelationsHandler.createRelation(
      workspace, relationName, fromModelId, toModelId, relationDef, cb);
};

connector.createMiddleware = function(workspaceId, phase, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
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

connector.createModel = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.createModel(workspace, id, data, cb);
};

connector.findModel = function(workspaceId, id, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  if (id)
    ModelHandler.findModel(workspace, id, cb);
  else
    ModelHandler.findAllModels(workspace, cb);
};

connector.findModelConfig = function(workspaceId, id, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.findModelConfig(workspace, id, cb);
};

connector.findDataSource = function(workspaceId, id, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  DataSourceHandler.findDataSource(workspace, id, cb);
};

connector.findMiddleware = function(workspaceId, phase, name, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  MiddlewareHandler.findMiddleware(workspace, phase, name, cb);
};

connector.updateDataSource = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  DataSourceHandler.updateDataSource(workspace, id, data, cb);
};

connector.updateModel = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.updateModel(workspace, id, data, cb);
};

connector.updateModelConfig = function(workspaceId, id, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelHandler.updateModelConfig(workspace, id, data.facetName, data, cb);
};

connector.createACL =
function(workspaceId, modelId, index, data, cb) {
  const workspace = WorkspaceManager.getWorkspace(workspaceId);
  ModelAccessHandler.createACL(workspace, modelId, index, data, cb);
};
