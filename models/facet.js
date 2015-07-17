var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');

var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var GatewayMap = app.models.GatewayMap;
var Middleware = app.models.Middleware;
var ModelConfig = app.models.ModelConfig;
var ConfigFile = app.models.ConfigFile;
var FacetSetting = app.models.FacetSetting;

/**
 * Defines a `LoopBackApp` configuration.
 * @class Facet
 * @inherits Definition
 */

var Facet = app.models.Facet;

/**
 * Create an I/O queue to serialize load/save to avoid file corruptions
 */
Facet.ioQueue = async.queue(function(task, cb) {
  task(cb);
}, 1); // Set concurrency to 1 so that tasks will be executed one by one

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
  var middlewares = ConfigFile.getFileByBase(configFiles, 'middleware');
  var policyConfigs = ConfigFile.getFileByBase(configFiles, 'policy-config');
  var modelDefinitionFiles = ConfigFile.getModelDefFiles(configFiles, facetName);
  var steps = [];

  var facetData = {
    name: facetName
  };
  debug('adding to cache facet [%s]');
  var facetId = Facet.addToCache(cache, facetData);

  if (facetConfig) {
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

  if (modelConfigs) {
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

  if (modelDefinitionFiles.length) {
    steps.push(function(cb) {
      modelDefinitionFiles.forEach(function(configFile) {
        var def = configFile.data || {};
        def.facetName = facetName;
        def.configFile = configFile.path;
        def.readonly = !!configFile.isReadOnly;

        debug('loading [%s] model definition into cache', def.name);

        var uniqueId = ModelDefinition.getUniqueId(def);

        ModelDefinition.addToCache(cache, def);
        ModelDefinition.addRelatedToCache(cache, def, facetName, uniqueId);
      });
      cb();
    });
  }

  if (dataSources) {
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

  if (policyConfigs) {
    steps.push(function(cb) {
      policyConfigs.load(cb);
    }, function(cb) {
      GatewayMap.deserialize(cache, facetName, policyConfigs);
      cb();
    });
  }

  if (middlewares) {
    steps.push(function(cb) {
      middlewares.load(cb);
    }, function(cb) {
      Middleware.deserialize(cache, facetName, middlewares);
      cb();
    });
  }

  Facet.ioQueue.push(function(done) {
    async.series(steps, function(err) {
      if (err) return done(err);
      debug('loading finished');
      done();
    });
  }, cb);
}

Facet.saveToFs = function(cache, facetData, cb) {
  // TODO(ritch) try and remove this hack...
  // ensure ModelDefinition methods are defined
  require('./model-definition');

  var filesToSave = [];

  // Add a file to be saved with dedupe
  function addFileToSave(file) {
    for (var i = 0, n = filesToSave.length; i < n; i++) {
      if (filesToSave[i].path === file.path) {
        filesToSave[i] = file; // Replace the queued save
        return;
      }
    }
    // No match
    filesToSave.push(file);
  }

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

    addFileToSave(facetConfigFile);
  }

  if (hasApp) {
    var dataSourceConfig = {};
    var dataSourcePath = path.join(facetName, 'datasources.json');
    var cachedDataSources = DataSourceDefinition.allFromCache(cache);

    cachedDataSources.forEach(function(dataSourceDef) {
      if (dataSourceDef.facetName === facetName) {
        dataSourcePath = DataSourceDefinition.getPath(facetName, dataSourceDef);
        dataSourceConfig[dataSourceDef.name] =
          DataSourceDefinition.getConfigFromData(dataSourceDef);
      }
    });

    addFileToSave(new ConfigFile({
      path: dataSourcePath,
      data: dataSourceConfig
    }));

    var policyConfigFile = GatewayMap.serialize(cache, facetName);
    if (policyConfigFile) {
      addFileToSave(policyConfigFile);
    }

    var middlewareFile = Middleware.serialize(cache, facetName);
    if (middlewareFile) {
      addFileToSave(middlewareFile);
    }

    var cachedModelConfigs = ModelConfig.allFromCache(cache);
    var modelConfigPath = path.join(facetName, ModelConfig.settings.defaultConfigFile);
    var modelConfigFile = new ConfigFile({path: modelConfigPath}); // model-config.json
    var modelConfigJson = modelConfigFile.data = {};

    modelConfigJson._meta = facetData.modelsMetadata;

    cachedModelConfigs.forEach(function(modelConfig) {
      if (modelConfig.facetName === facetName) {
        modelConfigJson[modelConfig.name] =
          ModelConfig.getConfigFromData(modelConfig);
      }
    });

    addFileToSave(modelConfigFile);
  }

  var cachedModels = ModelDefinition.allFromCache(cache);

  cachedModels.forEach(function(modelDef) {
    debug('model definition ~ %j', modelDef);
    if (modelDef.readonly) return;
    if (modelDef.facetName === facetName) {
      var modelConfigFile = ModelDefinition.getConfigFile(facetName, modelDef);
      modelConfigFile.data = ModelDefinition.getConfigFromCache(cache, modelDef);
      addFileToSave(modelConfigFile);
    }
  });

  Facet.ioQueue.push(function(done) {
    // TODO(ritch) files that exist without data in the cache should be deleted
    async.each(filesToSave, function(configFile, cb) {
      debug('file [%s]', configFile.path);
      configFile.save(cb);
    }, function(err) {
      if (err) return done(err);
      debug('saving finished');
      done();
    });
  }, cb);
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
