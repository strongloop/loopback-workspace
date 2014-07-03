var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var debug = require('debug')('workspace:component');

var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ComponentModel = app.models.ComponentModel;
var ConfigFile = app.models.ConfigFile;
var PackageDefinition = app.models.PackageDefinition;

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
  var componentModels = ConfigFile.getFileByBase(configFiles, 'models');
  var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
  var modelDefinitionFiles = ConfigFile.getModelDefFiles(configFiles, componentName);
  var packageFile = ConfigFile.getFileByBase(configFiles, 'package');
  var steps = [];

  if(packageFile) {
    steps.push(function(cb) {
      packageFile.load(cb);
    }, function(cb) {
      packageFile.data.componentName = componentName;
      PackageDefinition.addToCache(cache, packageFile.data || {});
      cb();
    });
  }

  if(component) {
    steps.push(function(cb) {
      component.load(cb);
    }, function(cb) {
      component.data = component.data || {};
      component.data.configFile = component.path;
      component.data.name = componentName;
      debug('adding to cache component file [%s]', component.path);
      ComponentDefinition.addToCache(cache, component.data);
      cb();
    });
  } else {
    steps.push(function(cb) {
      var componentData = {
        name: componentName,
        configFile: path.join(componentName, 'config.json')
      };
      debug('adding to cache component entry [%s]', componentData.configFile);
      ComponentDefinition.addToCache(cache, componentData);
      cb();
    });
  }

  if(componentModels) {
    steps.push(function(cb) {
      componentModels.load(cb);
    }, function(cb) {
      var modelDefs = componentModels.data || {};
      var modelNames = Object.keys(modelDefs).filter(function(modelName) {
        // exclude _meta / other private properties
        return modelName.charAt(0) !== '_';
      });

      modelNames.forEach(function(modelName) {
        var componentModel = modelDefs[modelName];
        componentModel.componentName = componentName;
        componentModel.name = modelName;
        ComponentModel.addToCache(cache, componentModel);
      });

      cb();
    });
  }

  modelDefinitionFiles.forEach(function(configFile) {
    steps.push(configFile.load.bind(configFile));
  });

  if(modelDefinitionFiles.length) {
    steps.push(function(cb) {
      modelDefinitionFiles.forEach(function(configFile) {
        var def = configFile.data || {};
        def.componentName = componentName;
        def.configFile = configFile.path;
        var modelDef = new ModelDefinition(def);

        debug('loading [%s] model definition into cache', def.name);

        ModelDefinition.addToCache(cache, def);
        ModelDefinition.addRelatedToCache(cache, def, componentName
          , modelDef.getUniqueId());
      });
      cb();
    });
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
        DataSourceDefinition.addToCache(cache, def);
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

  var hasApp = ComponentDefinition.hasApp(componentDef);

  if (hasApp) {
    var configFile = ComponentDefinition.getConfigFile(componentName, componentDef);
    // remove extra data that shouldn't be persisted to the fs
    delete componentDef.configFile;
    delete componentDef.name;
    configFile.data = componentDef;

    filesToSave.push(configFile);
  }

  PackageDefinition.allFromCache(cache).forEach(function(package) {
    if(package.componentName === componentName) {
      var packageFile = new ConfigFile({
        path: PackageDefinition.getPath(componentName, package),
        data: package
      });
      delete package.componentName;
      filesToSave.push(packageFile);
    }
  });

  if (hasApp) {
    var dataSoureConfig = {};
    var dataSourcePath = path.join(componentName, 'datasources.json');
    var cachedDataSources = DataSourceDefinition.allFromCache(cache);

    cachedDataSources.forEach(function(dataSourceDef) {
      if(dataSourceDef.componentName === componentName) {
        dataSourcePath = DataSourceDefinition.getPath(componentName, dataSourceDef);
        dataSoureConfig[dataSourceDef.name] = dataSourceDef;
        delete dataSourceDef.name;
        delete dataSourceDef.id;
        delete dataSourceDef.componentName;
      }
    });

    filesToSave.push(new ConfigFile({
      path: dataSourcePath,
      data: dataSoureConfig
    }));

    var cachedComponentModels = ComponentModel.allFromCache(cache);
    var componentModelsPath = path.join(componentName, ComponentModel.settings.defaultConfigFile);
    var componentModelFile = new ConfigFile({path: componentModelsPath}); // models.json
    var componentModelsConfig = componentModelFile.data = {};

    cachedComponentModels.forEach(function(componentModel) {
      if(componentModel.componentName === componentName) {
        componentModelsConfig[componentModel.name] = componentModel;
        delete componentModel.name;
        delete componentModel.id;
        delete componentModel.componentName;
      }
    });

    filesToSave.push(componentModelFile);
  }

  var cachedModels = ModelDefinition.allFromCache(cache);

  cachedModels.forEach(function(modelDef) {
    debug('model definition ~ %j', modelDef);
    if(modelDef.componentName === componentName) {
      delete modelDef.dataSource;
      var modelConfigFile = ModelDefinition.getConfigFile(componentName, modelDef);
      modelConfigFile.data = ModelDefinition.getConfigData(cache, modelDef);
      delete modelDef.componentName;
      delete modelDef.id;
      filesToSave.push(modelConfigFile);
    }
  });

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

ComponentDefinition.hasApp = function(componentDef) {
  // At the moment, the root component does not have `app.js`,
  // all other components (rest, server) have their app.js
  // In the future, we should read this from component,
  // e.g. package.json > loopback-workspace > app: true|false
  return componentDef.name !== '.';
};

ComponentDefinition.prototype.getUniqueId = function() {
  return this.name || null;
}
