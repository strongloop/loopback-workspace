var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var debug = require('debug')('workspace:component');

var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ConfigFile = app.models.ConfigFile;

/**
 * Defines a `LoopBackApp` configuration.
 * @class ComponentDefinition
 * @inherits Definition
 */

var ComponentDefinition = app.models.ComponentDefinition;

/**
 * Load the app with the given name into the connector cache.
 *
 * @param {String} componentName
 * @param {Object} components An `Object` keyed by componentName containing arrays of 
 * config files.
 * @callback {Function} callback
 * @param {Error} err
 */

ComponentDefinition.loadIntoCache = function(cache, componentName, components, cb) {
  var debug = require('debug')('workspace:component:load:' + componentName);
  var configFiles = components[componentName];
  var component = ConfigFile.getFileByBase(configFiles, 'config');
  var models = ConfigFile.getFileByBase(configFiles, 'models');
  var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
  var steps = [];

  if(component) {
    steps.push(function(cb) {
      component.load(cb);
    }, function(cb) {
      component.data = component.data || {};
      component.data.configFile = component.path;
      component.data.name = componentName;
      debug('adding to cache component file [%s]', component.path);
      ComponentDefinition.addToCache(cache, componentName, component.data);
      cb();
    });
  } else {
    debug('component configFile does not exist');
  }

  if(models) {
    steps.push(function(cb) {
      models.load(cb);
    }, function(cb) {
      var modelDefs = models.data || {};
      var modelNames = Object.keys(modelDefs).filter(function(modelName) {
        // exclude _meta / other private properties
        return modelName.charAt(0) !== '_';
      });

      debug('loading models from [%s] %j', models.path, modelDefs);

      async.each(modelNames, function(modelName, cb) {
        var def = modelDefs[modelName];
        var configFile = ConfigFile
          .getFileByBase(configFiles, ModelDefinition.toFilename(modelName));
        def.name = modelName;
        def.componentName = componentName;

        if(configFile) {
          def.configFile = configFile.path;
          debug('loading [%s] model into cache', modelName);
          ModelDefinition.addToCache(cache, modelName, def);
          configFile.load(function(err) {
            if(err) return cb(err);
            ModelDefinition.addRelatedToCache(cache, modelName, configFile.data);
            cb();
          });
        } else {
          debug('configFile not found for [%s]', modelName);
          ModelDefinition.addToCache(cache, modelName, def);
          cb();
        }
      }, cb);
    });
  } else {
    debug('no models file found (eg. models.json)');
  }

  if(dataSources) {
    steps.push(function(cb) {
      dataSources.load(cb);
    }, function(cb) {
      var dataSourceDefs = dataSources.data || {};
      var dataSourceNames = Object.keys(dataSourceDefs);

      dataSourceNames.forEach(function(dataSourceName) {
        var def = dataSourceDefs[dataSourceName];
        def.configFile = dataSources.path;
        def.name = dataSourceName;
        def.componentName = componentName;
        debug('loading [%s] dataSource into cache', dataSourceName);
        DataSourceDefinition.addToCache(cache, dataSourceName, def);
      });
      
      cb();
    });
  }

  async.series(steps, function(err) {
    if(err) return cb(err);
    debug('loading finished');
    cb();
  });
}

var i = 0;
var temp;

ComponentDefinition.saveToFs = function(cache, componentDef, cb) {
  // TODO(ritch) try and remove this hack...
  // ensure ModelDefinition methods are defined
  require('./model-definition');

  var filesToSave = [];

  var componentName = componentDef.name;
  assert(componentName);

  var debug = require('debug')('workspace:component:save:' + componentName);

  var configFile = ComponentDefinition.getConfigFile(componentName, componentDef);
  // remove extra data that shouldn't be persisted to the fs
  delete componentDef.configFile;
  configFile.data = componentDef;

  filesToSave.push(configFile);

  var dataSoureConfig = {};
  var dataSourcePath;

  DataSourceDefinition.allFromCache(cache).forEach(function(dataSourceDef) {
    if(dataSourceDef.componentName === componentName) {
      dataSourcePath = DataSourceDefinition.getPath(componentName, dataSourceDef);
      dataSoureConfig[dataSourceDef.name] = dataSourceDef;
      delete dataSourceDef.name;
    }
  });

  if(dataSourcePath) {
    filesToSave.push(new ConfigFile({
      path: dataSourcePath,
      data: dataSoureConfig
    }));
  }

  var modelConfig = {};
  var modelPath;
  var cachedModels = ModelDefinition.allFromCache(cache);

  cachedModels.forEach(function(modelDef) {
    debug('%j', modelDef);
    if(modelDef.componentName === componentName) {
      // TODO(ritch) should the model+datasource definitions (models.json)
      // exist on the ComponentDefinition?
      modelPath = path.join(componentName, ModelDefinition.settings.defaultConfigFile);
      modelConfig[modelDef.name] = {
        dataSource: modelDef.dataSource
      };
      delete modelDef.dataSource;
      var modelConfigFile = ModelDefinition.getConfigFile(componentName, modelDef);
      modelConfigFile.data = ModelDefinition.getConfigData(cache, modelDef);
      filesToSave.push(modelConfigFile);
    }
  });

  if(modelPath) {
    filesToSave.push(new ConfigFile({
      path: modelPath,
      data: modelConfig
    }));
  } else {
    debug('not saving models to files [cachedModels.length => %s]', cachedModels.length);
  }

  // TODO(ritch) files that exist without data in the cache should be deleted
  async.each(filesToSave, function(configFile, cb) {
    debug('file [%s]', configFile.path);  
    configFile.save(cb);
  }, function(err) {
    if(err) return cb(err);
    debug('saving finished');
    cb();
  });
}
