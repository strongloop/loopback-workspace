var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var debug = require('debug')('workspace:facet');
var extend = require('util')._extend;

var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelConfig = app.models.ModelConfig;
var ConfigFile = app.models.ConfigFile;
var PackageDefinition = app.models.PackageDefinition;
var FacetSetting = app.models.FacetSetting;

/**
 * Defines a `LoopBackApp` configuration.
 * @class Facet
 * @inherits Definition
 */

var Facet = app.models.Facet;

/**
 * Load the app with the given name into the connector cache.
 *
 * @param {String} facetName
 * @param {Object} allConfigFiles An `Object` keyed by facetName containing arrays of
 * config files.
 * @callback {Function} callback
 * @param {Error} err
 */

Facet.loadIntoCache = function(cache, facetName, allConfigFiles, cb) {
  var debug = require('debug')('workspace:facet:load:' + facetName);
  var configFiles = allConfigFiles[facetName];
  var facetConfig = ConfigFile.getFileByBase(configFiles, 'config');
  var modelConfigs = ConfigFile.getFileByBase(configFiles, 'model-config');
  var dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
  var modelDefinitionFiles = ConfigFile.getModelDefFiles(configFiles, facetName);
  var packageFile = ConfigFile.getFileByBase(configFiles, 'package');
  var steps = [];

  var facetData = {
    name: facetName
  };
  debug('adding to cache facet [%s]');
  var facetId = Facet.addToCache(cache, facetData);

  if(packageFile) {
    steps.push(function(cb) {
      packageFile.load(cb);
    }, function(cb) {
      packageFile.data.facetName = facetName;
      PackageDefinition.addToCache(cache, packageFile.data || {});
      cb();
    });
  }

  if(facetConfig) {
    steps.push(function(cb) {
      facetConfig.load(cb);
    }, function(cb) {
      debug('adding to cache facet file [%s]', facetConfig.path);
      Object.keys(facetConfig.data).forEach(function(name) {
        var value = {
          name: name,
          value: facetConfig.data[name],
          configFile: facetConfig.path,
          facetName: facetName
        };
        FacetSetting.addToCache(cache, value);
      });
      cb();
    });
  }

  if(modelConfigs) {
    steps.push(function(cb) {
      modelConfigs.load(cb);
    }, function(cb) {
      var modelConfigJson = modelConfigs.data || {};
      var modelNames = Object.keys(modelConfigJson).filter(function(modelName) {
        // exclude _meta / other private properties
        return modelName.charAt(0) !== '_';
      });

      modelNames.forEach(function(modelName) {
        var modelConfig = modelConfigJson[modelName];
        modelConfig.facetName = facetName;
        modelConfig.name = modelName;
        ModelConfig.addToCache(cache, modelConfig);
      });

      if (modelConfigJson._meta) {
        var facetEntity = Facet.getFromCache(cache, facetId);
        facetEntity.modelsMetadata = modelConfigJson._meta;
        Facet.updateInCache(cache, facetId, facetEntity);
      }

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
        def.facetName = facetName;
        def.configFile = configFile.path;
        var modelDef = new ModelDefinition(def);

        debug('loading [%s] model definition into cache', def.name);

        ModelDefinition.addToCache(cache, def);
        ModelDefinition.addRelatedToCache(cache, def, facetName
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
        def.facetName = facetName;
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

Facet.saveToFs = function(cache, facetData, cb) {
  // TODO(ritch) try and remove this hack...
  // ensure ModelDefinition methods are defined
  require('./model-definition');

  var filesToSave = [];

  var facetName = facetData.name;
  assert(facetName);

  var debug = require('debug')('workspace:facet:save:' + facetName);

  var hasApp = Facet.hasApp(facetData);

  if (hasApp) {
    var facetConfigFile = FacetSetting.getConfigFile(facetName, {});
    facetConfigFile.data = {};

    FacetSetting.allFromCache(cache).forEach(function(setting) {
      if (setting.facetName !== facetName) return;
      facetConfigFile.data[setting.name] = setting.value;
    });

    filesToSave.push(facetConfigFile);
  }

  PackageDefinition.allFromCache(cache).forEach(function(package) {
    if(package.facetName === facetName) {
      var packageFile = new ConfigFile({
        path: PackageDefinition.getPath(facetName, package),
        data: package
      });
      delete package.facetName;
      filesToSave.push(packageFile);
    }
  });

  if (hasApp) {
    var dataSoureConfig = {};
    var dataSourcePath = path.join(facetName, 'datasources.json');
    var cachedDataSources = DataSourceDefinition.allFromCache(cache);

    cachedDataSources.forEach(function(dataSourceDef) {
      if(dataSourceDef.facetName === facetName) {
        dataSourcePath = DataSourceDefinition.getPath(facetName, dataSourceDef);
        dataSoureConfig[dataSourceDef.name] =
          DataSourceDefinition.getConfigFromData(dataSourceDef);
      }
    });

    filesToSave.push(new ConfigFile({
      path: dataSourcePath,
      data: dataSoureConfig
    }));

    var cachedModelConfigs = ModelConfig.allFromCache(cache);
    var modelConfigPath = path.join(facetName, ModelConfig.settings.defaultConfigFile);
    var modelConfigFile = new ConfigFile({path: modelConfigPath}); // model-config.json
    var modelConfigJson = modelConfigFile.data = {};

    modelConfigJson._meta = facetData.modelsMetadata;

    cachedModelConfigs.forEach(function(modelConfig) {
      if(modelConfig.facetName === facetName) {
        modelConfigJson[modelConfig.name] =
          ModelConfig.getConfigFromData(modelConfig);
      }
    });

    filesToSave.push(modelConfigFile);
  }

  var cachedModels = ModelDefinition.allFromCache(cache);

  cachedModels.forEach(function(modelDef) {
    debug('model definition ~ %j', modelDef);
    if(modelDef.facetName === facetName) {
      var modelConfigFile = ModelDefinition.getConfigFile(facetName, modelDef);
      modelConfigFile.data = ModelDefinition.getConfigFromCache(cache, modelDef);
      filesToSave.push(modelConfigFile);
    }
  });

  // TODO(ritch) files that exist without data in the cache should be deleted
  async.each(filesToSave, function(configFile, cb) {
    debug('file [%s]', configFile.path);
    configFile.save(cb);
  }, function(err) {
    if (err) return cb(err);
    debug('saving finished');
    cb();
  });
}

Facet.hasApp = function(facetData) {
  // At the moment, the common facet does not have `app.js`,
  // all other facets (server, client) have their app.js
  // In the future, we should create subclasses of the Facet (ServerFacet,...)
  // and override the value there.
  return facetData.name !== 'common';
};

Facet.getUniqueId = function(data) {
  return data.name || null;
}
