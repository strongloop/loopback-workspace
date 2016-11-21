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

operations.prototype.updateFacet = function (workspace,  name) {
  return workspace.updateFacet(name);
}

operations.prototype.updateFacetConfig = function (workspace, facetName, value) {
  var id = FacetSetting.getUniqueId(value);
  return workspace.updateFacetConfig(id, facetName);
}

operations.prototype.updateModelConfig = function (workspace, id, modelConfig) {
  return workspace.updateModelConfig(id); 
}

operations.prototype.updateModel = function (workspace,  uniqueId) {
  return workspace.updateModel(uniqueId);
}

operations.prototype.updateModelProperty = function (workspace, uniqueId) {
  return workspace.updateProperty(uniqueId);
}

operations.prototype.updateModelMethod = function (workspace, uniqueId) {
  return workspace.updateMethod(uniqueId);
}

operations.prototype.updateDatasource = function (workspace,  uniqueId) {
  return workspace.updateDatasource(uniqueId);
}

operations.prototype.updateMiddleware = function (workspace,  uniqueId){
  return workspace.updateMiddleware(uniqueId);
}





