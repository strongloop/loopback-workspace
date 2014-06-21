var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var debug = require('debug')('workspace:app');

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

AppDefinition.loadIntoCache = function(cache, appName, apps, cb) {
  var debug = require('debug')('workspace:app:load:' + appName);
  var configFiles = apps[appName];
  var app = ConfigFile.getFileByBase(configFiles, 'app');
  var models = ConfigFile.getFileByBase(configFiles, 'models');
  var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
  var steps = [];

  if(app) {
    steps.push(function(cb) {
      app.load(cb);
    }, function(cb) {
      app.data = app.data || {};
      app.data.configFile = app.path;
      app.data.name = appName;
      debug('adding to cache app file [%s]', app.path);
      AppDefinition.addToCache(cache, appName, app.data);
      cb();
    });
  } else {
    debug('app configFile does not exist');
  }

  if(models) {
    steps.push(function(cb) {
      console.log('load models!!!')
      models.load(cb);
    }, function(cb) {
      console.log('load loaded!!!')
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
        def.appName = appName;

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
        def.appName = appName;
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

AppDefinition.saveToFs = function(cache, appDef, cb) {
  // TODO(ritch) try and remove this hack...
  // ensure ModelDefinition methods are defined
  require('./model-definition');

  var filesToSave = [];

  var appName = appDef.name;
  assert(appName);

  var debug = require('debug')('workspace:app:save:' + appName);

  var configFile = AppDefinition.getConfigFile(appName, appDef);
  // remove extra data that shouldn't be persisted to the fs
  delete appDef.configFile;
  configFile.data = appDef;
  filesToSave.push(configFile);

  var dataSoureConfig = {};
  var dataSourcePath;

  DataSourceDefinition.allFromCache(cache).forEach(function(dataSourceDef) {
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
  var cachedModels = ModelDefinition.allFromCache(cache);
  
  cachedModels.forEach(function(modelDef) {
    debug('%j', modelDef);
    if(modelDef.appName === appName) {
      // TODO(ritch) should the model+datasource definitions (models.json)
      // exist on the AppDefinition?
      modelPath = path.join(appName, ModelDefinition.settings.defaultConfigFile);
      modelConfig[modelDef.name] = {
        dataSource: modelDef.dataSource
      };
      delete modelDef.dataSource;
      var modelConfigFile = ModelDefinition.getConfigFile(appName, modelDef);
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
