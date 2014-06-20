var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ConfigFile = app.models.ConfigFile;

/**
 * Defines a `LoopBackApp` configuration.
 * @class AppDefinition
 * @inherits Definition
 */

var AppDefinition = app.models.AppDefinition;

/**
 * Load the app with the given name into the connector cache.
 *
 * @param {String} appName
 * @param {Object} apps An `Object` keyed by appName containing arrays of 
 * config files.
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.loadIntoCache = function(appName, apps, cb) {
  var configFiles = apps[appName];
  var app = ConfigFile.getFileByBase(configFiles, 'app');
  var models = ConfigFile.getFileByBase(configFiles, 'models');
  var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
  var steps = [];

  if(app) {
    steps.push(function(cb) {
      app.load(cb);
    }, function(cb) {
      app.data.configFile = app.path;
      AppDefinition.addToCache(app, app.data);
      cb();
    });
  }

  if(models) {
    steps.push(function(cb) {
      models.load(cb);
    }, function(cb) {
      var modelDefs = models.data;
      var modelNames = Object.keys(models.data).filter(function(modelName) {
        // exclude _meta / other private properties
        return modelName.charAt(0) !== '_';
      });

      async.each(modelNames, function(modelName, cb) {
        var def = modelDefs[modelName];
        var configFile = ConfigFile
          .getFileByBase(configFiles, ModelDefinition.toFilename(modelName));
        def.name = modelName;

        if(configFile) {
          def.configFile = configFile.path;
          ModelDefintion.addToCache(modelName, def);
          configFile.load(function(err) {
            if(err) return cb(err);
            ModelDefintion.addRelatedToCache(modelName, configFile.data);
            cb();
          });
        } else {
          ModelDefintion.addToCache(modelName, def);
          cb();
        }
      }, cb);
    });
  }

  if(dataSources) {
    steps.push(function(cb) {
      dataSources.load(cb);
    }, function(cb) {
      var dataSourceDefs = dataSources.data;
      var dataSourceNames = Object.keys(dataSourceDefs);

      var def = dataSourceDefs[dataSourceName];
      def.configFile = dataSources.path;
      def.name = dataSourceName;
      def.appName = appName;
      DataSourceDefinition.addToCache(dataSourceName, def);

      cb();
    });
  }
}

AppDefinition.saveToFs = function(appDef, cb) {
  var filesToSave = [];

  var appName = appDef.name;
  assert(appName);

  var configFile = AppDefinition.getConfigFile(appName, appDef);
  // remove extra data that shouldn't be persisted to the fs
  delete appDef.configFile;
  configFile.data = appDef;
  filesToSave.push(configFile);

  var dataSoureConfig = {};
  var dataSourcePath;
  DataSourceDefinition.allFromCache().forEach(function(dataSourceDef) {
    if(dataSourceDef.appName === appName) {
      dataSourcePath = DataSourceDefinition.getPath(appName, dataSourceDef);
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

  ModelDefinition.allFromCache().forEach(function(modelDef) {
    if(modelDef.appName === appName) {
      // TODO(ritch) should the model+datasource definitions (models.json)
      // exist on the AppDefinition?
      modelPath = path.join(appName, ModelDefinition.settings.defaultConfigFile);
      modelConfig[modelDef.name] = {
        dataSource: modelDef.dataSource
      };
      delete modelDef.dataSource;
      var modelConfigFile = ModelDefinition.getConfigFile(appName, modelDef);
      modelConfigFile.data = ModelDefinition.getConfigData(modelDef);
      filesToSave.push(modelConfigFile);
    }
  });

  if(modelPath) {
    filesToSave.push(new ConfigFile({
      path: modelPath,
      data: modelConfig
    }));
  }

  // TODO(ritch) files that exist without data in the cache should be deleted
  async.each(filesToSave, function(configFile, cb) {
    configFile.save(cb);
  }, cb);
}
