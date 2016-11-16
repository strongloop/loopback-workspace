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

operations.prototype.deleteFacet = function (workspace,  name) {
  return workspace.removeFacet(name);
}

operations.prototype.deleteFacetConfig = function (workspace, facetName, value) {
  var id = FacetSetting.getUniqueId(value);
  return workspace.removeFacetConfig(id, facetName);
}

operations.prototype.deleteModelConfig = function (workspace, id, modelConfig) {
  return workspace.removeModelConfig(id); 
}

operations.prototype.deleteModel = function (workspace,  uniqueId) {
  return workspace.removeModel(uniqueId);
}

operations.prototype.deleteModelProperty = function (workspace, uniqueId) {
  return workspace.removeProperty(uniqueId);
}

operations.prototype.deleteModelMethod = function (workspace, uniqueId) {
  return workspace.removeMethod(uniqueId);
}

operations.prototype.deleteDatasource = function (workspace,  uniqueId) {
  return workspace.removeDatasource(uniqueId);
}

operations.prototype.deleteMiddleware = function (workspace,  uniqueId){
  return workspace.removeMiddleware(uniqueId);
}





