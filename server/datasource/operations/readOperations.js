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

operations.prototype.readFacet = function (workspace,  name) {
  return workspace.getFacet(name);
}

operations.prototype.readFacetConfig = function (workspace, facetName, value) {
  var id = FacetSetting.getUniqueId(value);
  return workspace.getFacetConfig(id, facetName);
}

operations.prototype.readModelConfig = function (workspace, id, modelConfig) {
  return workspace.getModelConfig(id); 
}

operations.prototype.readModel = function (workspace,  uniqueId) {
  return workspace.getModel(uniqueId);
}

operations.prototype.readModelProperty = function (workspace, uniqueId) {
  return workspace.getProperty(uniqueId);
}

operations.prototype.readModelMethod = function (workspace, uniqueId) {
  return workspace.getMethod(uniqueId);
}

operations.prototype.readDatasource = function (workspace,  uniqueId) {
  return workspace.getDatasource(uniqueId);
}

operations.prototype.readMiddleware = function (workspace,  uniqueId){
  return workspace.getMiddleware(uniqueId);
}





