// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../server');
var ModelDefinition = app.models.ModelDefinition;
var Middleware = app.models.Middleware;
var ComponentConfig = app.models.ComponentConfig;
var ModelConfig = app.models.ModelConfig;
var async = require('async');
var assert = require('assert');
var path = require('path');
var FacetSetting = app.models.FacetSetting;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ConfigFile = app.models.ConfigFile;
var operations = require('./operations');
var dataModel = require('./datamodel');
module.exports = macrooperations;

function macrooperations() {

}

macrooperations.prototype.loadWorkspace = function(workspaceDir, facetName, callback) {
    
    var FacetSetting = app.models.FacetSetting;
    var DataSourceDefinition = app.models.DataSourceDefinition;
    var ConfigFile = app.models.ConfigFile;

   listOfFiles(workspaceDir, function(allConfigFiles){
     var workspace = new dataModel("root", workspaceDir, {});
     var configFiles = allConfigFiles[facetName];
     var facetConfig = ConfigFile.getFileByBase(configFiles, 'config');
     var modelConfigs = ConfigFile.getFileByBase(configFiles, 'model-config');
     var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
     var middlewares = ConfigFile.getFileByBase(configFiles, 'middleware');
     var componentConfigs = ConfigFile.getFileByBase(configFiles, 'component-config');
     var modelDefinitionFiles = ConfigFile.getModelDefFiles(configFiles, facetName);
     var artifacts = operations.getArtifacts(configFiles);
     loadFacet(workspace, facetName, artifacts, facetConfig, modelConfigs, dataSources, middlewares, componentConfigs, modelDefinitionFiles, callback);
   });
}

macrooperations.prototype.loadFacet = function(workspace, facetName, artifacts, facetConfig, modelConfigs, dataSources, middlewares, componentConfigs, modelDefinitionFiles, cb) {
    var steps = [];
    var facetId = operations.getFacetId(facetName);
   
    var facetData = {
      name: facetName,
    };
    operations.addFacet(facetName, facetData);

    if (facetConfig) {
      steps.push(function(cb) {
        facetConfig.load(function(){
          Object.keys(facetConfig.data).forEach(function(name) {
            var value = {
              name: name,
              value: facetConfig.data[name],
              configFile: facetConfig.path,
              facetName: facetName,
            };
            operations.addFacetConfig(workspace, value);
            cb();
          });  
        });
      });
    }
    var modelConfigNode = null;
    if (modelConfigs) {
      steps.push(function(cb) {
        modelConfigs.load(function(){
          modelConfigNode = operations.addModelConfigs(workspace, modelConfigs, facetId);
          cb();
        });
      });
    }

    if (modelDefinitionFiles) {
      modelDefinitionFiles.forEach(function (modelDef) {
        steps.push(function(cb) {
          var modelConfigJson = modelConfigs.data || {};
          modelDef.load(function (){
            operations.addModel(workspace, modelDef, modelConfigJson, modelConfigNode);
            cb();
          });
        })
      });
    }

    if (dataSources) {
      steps.push(function(cb) {
        dataSources.load(function () {
          operations.addDatasources(workspace, dataSources);
          cb();
        });
      });
    }

    if (middlewares) {
      steps.push(function(cb) {
        middlewares.load(function () {
          operations.addMiddlewares(workspace, middlewares, facetName);
          cb();
        });
      });
    }

    /*if (componentConfigs) {
      steps.push(function(cb) {
        operations.addComponents(workspace, componentConfigs, cb);
      });
    }*/

    /* eslint-disable one-var */
    for (var a in artifacts) {
      steps.push(createLoader(a));
    }
  
    async.series(steps, function(err) {
      if (err) {
        callback(err); 
        return done(err);
      }  else {
        debug('loading finished');
        callback(); 
        done();
      } 
    });
}

function getArtifacts(configFiles){
  var artifacts = {};
  for (var at in Facet.artifactTypes) {
    var file = ConfigFile.getFileByBase(configFiles, at);
    debug('Loading %s from %s', at, file);
    if (file) {
      artifacts[at] = file;
    }
  }
  return artifacts;
} 

function getFacetId(facetName) {
  debug('adding to cache facet [%s]');
  var facetData = {
    name: facetName,
  };
  var facetId = Facet.addToCache(cache, facetData);
}

function createLoader(a) {
  return function(cb) {
    Facet.artifactTypes[a].load(cache, facetName, artifacts[a], cb);
  };
}

function listOfFiles(workspaceDir, cb){
  var patterns = [];
  var models = app.models();
  models.forEach(function(Model) {
    if (!entityFilter(Model.modelName, Model.definition)) return;
    var options = Model.settings || {};
    if (options.configFiles) {
      patterns = patterns.concat(options.configFiles);
    }
  });

  patterns = patterns.concat(patterns.map(function(pattern) {
    return path.join('*', pattern);
  }));

  async.map(patterns, find, function(err, paths) {
    if (err) return cb(err);

    // flatten paths into single list
    var merged = [];
    merged = merged.concat.apply(merged, paths);

    var configFiles = merged.map(function(filePath) {
      return new ConfigFile({ path: filePath });
    });
    cb(null, configFiles);
  });

  function find(pattern, cb) {
    glob(pattern, { cwd: workspaceDir }, cb);
  }
}





