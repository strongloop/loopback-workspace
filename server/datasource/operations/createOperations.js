// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../server');
var async = require('async');
var assert = require('assert');
var path = require('path');
var ModelDefinition = app.models.ModelDefinition;
var Middleware = app.models.Middleware;
var ComponentConfig = app.models.ComponentConfig;
var ModelConfig = app.models.ModelConfig;
var Facet = app.models.Facet;
var FacetSetting = app.models.FacetSetting;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ConfigFile = app.models.ConfigFile;

module.exports = operations;

operations.prototype.createFacet = function (workspace,  name, value) {
  workspace.addFacet(name, value, false);
}

operations.prototype.createFacetConfig = function (workspace, facetName, value) {
  var id = FacetSetting.getUniqueId(value);
  workspace.addFacetConfig(id, facetName, value, false);
}

operations.prototype.createModelConfig = function (workspace, id, modelConfig) {
  var modelConfigNode = workspace.addModelConfig(id, modelConfig, false);
}

operations.prototype.createModel = function (workspace,  modelDef) {
  var operations = this; 
  var uniqueId = ModelDefinition.getUniqueId(modelDef);
  var facetName = modelDef.facetName;
  var modelConfigFile = ModelDefinition.getConfigFile(facetName, modelDef);
  workspace.addModel(uniqueId, modelDef, modelConfigFile, false);
}

operations.prototype.createModelProperty = function (workspace, uniqueId, modelProperty) {
  workspace.addProperty(modelName, uniqueId, modelProperty, false);
}

operations.prototype.createModelMethod = function (workspace, uniqueId, modelMethod) {
  workspace.addMethod(modelName, uniqueId, modelMethod, false);
}

operations.prototype.createDatasource = function (workspace,  dataSource) {
  var dataSourcePath = DataSourceDefinition.getPath(facetName, dataSourceDef);
  var configFile = new ConfigFile({
        path: dataSourcePath
      });
  workspace.addDatasources(uniqueId, dataSource, configFile, false);
}

operations.prototype.createMiddleware = function (workspace,  middleware){
  workspace.addMiddlewares(middleware, false);
}





