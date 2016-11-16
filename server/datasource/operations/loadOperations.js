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

operations.prototype.addFacet = function (workspace,  name, value) {
  workspace.addFacet(name, value, true);
}

operations.prototype.addFacetConfig = function (workspace, facetName, value) {
  var id = FacetSetting.getUniqueId(value);
  workspace.addFacetConfig(id, facetName, value, true);
}

operations.prototype.addModelConfigs = function (workspace,  modelConfigs, facetId) {
  var modelConfigPath = path.join(facetId, ModelConfig.settings.defaultConfigFile);
  var modelConfigFile = new ConfigFile({ path: modelConfigPath });
  var modelConfigNode = workspace.addModelConfig(facetId, modelConfigFile, true);
  //if (modelConfigJson._meta) {
    //var facetEntity = Facet.getFromCache(cache, facetId);
    //facetEntity.modelsMetadata = modelConfigJson._meta;
    //Facet.updateInCache(cache, facetId, facetEntity);
  //}
  return modelConfigNode;
}

operations.prototype.addModel = function (workspace,  configFile, modelConfigJson) {
  var operations = this;
  var def = configFile.data || {};
  def.facetName = facetName;
  def.configFile = configFile.path;
  def.readonly = !!configFile.isReadOnly;     
  var modelConfig = modelConfigJson[modelDef.name];
  modelConfig.facetName = facetName;
  modelConfig.name = modelDef.name;
  debug('adding [%s] model definition into cache', def.name);
  var uniqueId = ModelDefinition.getUniqueId(def);
  workspace.addModel(uniqueId, def, configFile, modelConfig, true);
  operations.addModelAttributes(modelDef.name, def, uniqueId, facetName, true);
}

operations.prototype.addModelAttributes = function (modelName, def, uniqueId, facetName) {
  var ModelDefinition = app.models.ModelDefinition;
  ModelDefinition.getEmbededRelations().forEach(function (workspace,  relation) {
    var relatedData = def[relation.as];
    var Entity = loopback.getModel(relation.model);
    var properties = Entity.definition.properties;

    if (Array.isArray(relatedData)) {
      relatedData.forEach(function (workspace,  config, index) {
        config[relation.foreignKey] = uniqueId;
        config.facetName = facetName;
        if (relation.embed && relation.embed.includeIndex) {
          config.index = index;
        }
        debug('addRelatedToCache %s %j', relation.model, config);
        if (relation.model === 'ModelProperty') {
          workspace.addProperty(modelName, uniqueId, config, true);
        } else if (relation.model === 'ModelProperty') {
          workspace.addMethod(modelName, uniqueId, config, true);
        }           
      });
    } else if (relatedData) {
      Object.keys(relatedData).forEach(function (workspace,  embedId) {
        var config = relatedData[embedId];
        if (relation.model === 'ModelProperty' && !(config && config.type)) {
          config = checkHiddenProperty(config);
        }
        //config = Entity.getDataFromConfig(config, embedId);
        //add extra properties for relations
        config[relation.foreignKey] = uniqueId;
        config[relation.embed.key] = embedId;
        config.facetName = facetName;
        debug('addRelatedToCache %s %j', relation.model, config);
        if (relation.model === 'ModelProperty') {
          workspace.addProperty(modelName, uniqueId, config, true);
        } else if (relation.model === 'ModelMethod') {
          workspace.addMethod(modelName, uniqueId, config, true);
        }   
      });
    }
  });
}

function checkHiddenProperty(config) {
  // https://github.com/strongloop/loopback-workspace/issues/223
  // {myProp: false} or {myProp: null} is to hide base myProp
  if (!config) {
    config = {
      disableInherit: true,
      comments: g.f('Flag to not inherit the property from base'),
    };
  } else {
    // expand shorthand notation
    config = { type: config };
  }
  debug('expanded model property %s.%s defined as %j',
    fileData.name, embedId, config);
  return config;
}

operations.prototype.addDatasources = function (workspace,  dataSources) {
    var dataSourceDefs = configFile.data || {};
    var dataSourceNames = Object.keys(dataSourceDefs);
    dataSourceNames.forEach(function (workspace,  dataSourceName) {
      var def = dataSourceDefs[dataSourceName];
      def.configFile = configFile.path;
      def.name = dataSourceName;
      def.facetName = facetName;
      var uniqueId = DataSourceDefinition.getUniqueId(def);
      debug('adding [%s] dataSource into cache', dataSourceName);
      workspace.addDatasources(uniqueId, def, configFile, true);
    });  
}

operations.prototype.addMiddlewares = function (workspace,  middlewares, facetName){
  workspace.addMiddlewares(facetName, configFile, true);
}

/*operations.prototype.addComponents = function (workspace,  componentConfigs, cb){
  componentConfigs.add(function (workspace,  cb) {
    debug('adding to cache component-config file [%s]', componentConfigs.path);
    ComponentConfig.deserialize(cache, facetName, componentConfigs);
    cb();
  });
} */  






