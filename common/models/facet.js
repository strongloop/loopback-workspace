// Copyright IBM Corp. 2015,2017. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const app = require('../../server/server');

module.exports = function(Facet) {
  app.once('ready', function() {
    ready(Facet);
  });
};

function ready(Facet) {
  const async = require('async');
  const assert = require('assert');
  const path = require('path');

  const ModelDefinition = app.models.ModelDefinition;
  const Middleware = app.models.Middleware;
  const ComponentConfig = app.models.ComponentConfig;
  const ModelConfig = app.models.ModelConfig;

  /**
   * Defines a `LoopBackApp` configuration.
   * @class Facet
   * @inherits Definition
   */

  /**
   * Create an I/O queue to serialize load/save to avoid file corruptions
   */
  Facet.ioQueue = async.queue(function(task, cb) {
    task(cb);
  }, 1); // Set concurrency to 1 so that tasks will be executed one by one

  Facet.artifactTypes = {};

  /**
   * Register a hander for the given artifact type
   * @param {String} name Config file name of the artifact
   * @param {Object} handler An object that has load()/save() methods
   */
  Facet.registerArtifactType = function(name, handler) {
    Facet.artifactTypes[name] = handler;
  };

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
    const FacetSetting = app.models.FacetSetting;
    const DataSourceDefinition = app.models.DataSourceDefinition;
    const ConfigFile = app.models.ConfigFile;

    const debug = require('debug')('workspace:facet:load:' + facetName);
    const configFiles = allConfigFiles[facetName];
    const facetConfig = ConfigFile.getFileByBase(configFiles, 'config');
    const modelConfigs = ConfigFile.getFileByBase(configFiles, 'model-config');
    const dataSources = ConfigFile.getFileByBase(configFiles, 'datasources');
    const middlewares = ConfigFile.getFileByBase(configFiles, 'middleware');
    const componentConfigs = ConfigFile.getFileByBase(configFiles, 'component-config');
    const modelDefinitionFiles = ConfigFile.getModelDefFiles(configFiles, facetName);

    const artifacts = {};
    for (const at in Facet.artifactTypes) {
      const file = ConfigFile.getFileByBase(configFiles, at);
      debug('Loading %s from %s', at, file);
      if (file) {
        artifacts[at] = file;
      }
    }
    const steps = [];

    const facetData = {
      name: facetName,
    };
    debug('adding to cache facet [%s]');
    const facetId = Facet.addToCache(cache, facetData);

    if (facetConfig) {
      steps.push(function(cb) {
        facetConfig.load(cb);
      }, function(cb) {
        debug('adding to cache facet file [%s]', facetConfig.path);
        Object.keys(facetConfig.data).forEach(function(name) {
          const value = {
            name: name,
            value: facetConfig.data[name],
            configFile: facetConfig.path,
            facetName: facetName,
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
        const modelConfigJson = modelConfigs.data || {};
        const modelNames = Object.keys(modelConfigJson).filter(function(modelName) {
          // exclude _meta / other private properties
          return modelName.charAt(0) !== '_';
        });

        modelNames.forEach(function(modelName) {
          const modelConfig = modelConfigJson[modelName];
          modelConfig.facetName = facetName;
          modelConfig.name = modelName;
          ModelConfig.addToCache(cache, modelConfig);
        });

        if (modelConfigJson._meta) {
          const facetEntity = Facet.getFromCache(cache, facetId);
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
          const def = configFile.data || {};
          def.facetName = facetName;
          def.configFile = configFile.path;
          def.readonly = !!configFile.isReadOnly;

          debug('loading [%s] model definition into cache', def.name);

          const uniqueId = ModelDefinition.getUniqueId(def);

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
        const dataSourceDefs = dataSources.data || {};
        const dataSourceNames = Object.keys(dataSourceDefs);

        dataSourceNames.forEach(function(dataSourceName) {
          const def = dataSourceDefs[dataSourceName];
          def.configFile = dataSources.path;
          def.name = dataSourceName;
          def.facetName = facetName;
          debug('loading [%s] dataSource into cache', dataSourceName);
          DataSourceDefinition.addToCache(cache, def);
        });
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

    if (componentConfigs) {
      steps.push(function(cb) {
        componentConfigs.load(cb);
      }, function(cb) {
        debug('adding to cache component-config file [%s]', componentConfigs.path);
        ComponentConfig.deserialize(cache, facetName, componentConfigs);
        cb();
      });
    }

    function createLoader(a) {
      return function(cb) {
        Facet.artifactTypes[a].load(cache, facetName, artifacts[a], cb);
      };
    }

    /* eslint-disable one-var */
    for (const a in artifacts) {
      steps.push(createLoader(a));
    }
    /* eslint-enable one-var */

    Facet.ioQueue.push(function(done) {
      async.series(steps, function(err) {
        if (err) return done(err);
        debug('loading finished');
        done();
      });
    }, cb);
  };

  Facet.saveToFs = function(cache, facetData, cb) {
    const FacetSetting = app.models.FacetSetting;
    const DataSourceDefinition = app.models.DataSourceDefinition;
    const ConfigFile = app.models.ConfigFile;
    const Middleware = app.models.Middleware;
    const ModelConfig = app.models.ModelConfig;
    const ModelDefinition = app.models.ModelDefinition;

    const filesToSave = [];

    // Add a file to be saved with dedupe
    function addFileToSave(file) {
      for (let i = 0, n = filesToSave.length; i < n; i++) {
        if (filesToSave[i].path === file.path) {
          filesToSave[i] = file; // Replace the queued save
          return;
        }
      }
      // No match
      filesToSave.push(file);
    }

    const facetName = facetData.name;
    assert(facetName);

    const debug = require('debug')('workspace:facet:save:' + facetName);

    const hasApp = Facet.hasApp(facetData);

    if (hasApp) {
      const facetConfigFile = FacetSetting.getConfigFile(facetName, {});
      facetConfigFile.data = {};

      FacetSetting.allFromCache(cache).forEach(function(setting) {
        if (setting.facetName !== facetName) return;
        facetConfigFile.data[setting.name] = setting.value;
      });

      addFileToSave(facetConfigFile);
    }

    if (hasApp) {
      const dataSourceConfig = {};
      let dataSourcePath = path.join(facetName, 'datasources.json');
      const cachedDataSources = DataSourceDefinition.allFromCache(cache);

      cachedDataSources.forEach(function(dataSourceDef) {
        if (dataSourceDef.facetName === facetName) {
          dataSourcePath = DataSourceDefinition.getPath(facetName, dataSourceDef);
          dataSourceConfig[dataSourceDef.name] =
            DataSourceDefinition.getConfigFromData(dataSourceDef);
        }
      });

      addFileToSave(new ConfigFile({
        path: dataSourcePath,
        data: dataSourceConfig,
      }));

      const middlewareFile = Middleware.serialize(cache, facetName);
      if (middlewareFile) {
        addFileToSave(middlewareFile);
      }

      const componentConfigFile = ComponentConfig.serialize(cache, facetName);
      if (componentConfigFile) {
        addFileToSave(componentConfigFile);
      }

      const cachedModelConfigs = ModelConfig.allFromCache(cache);
      const modelConfigPath = path.join(
        facetName, ModelConfig.settings.defaultConfigFile,
      );
      const modelConfigFile = new ConfigFile({path: modelConfigPath}); // model-config.json
      const modelConfigJson = modelConfigFile.data = {};

      modelConfigJson._meta = facetData.modelsMetadata;

      cachedModelConfigs.forEach(function(modelConfig) {
        if (modelConfig.facetName === facetName) {
          modelConfigJson[modelConfig.name] =
            ModelConfig.getConfigFromData(modelConfig);
        }
      });

      addFileToSave(modelConfigFile);
    }

    const cachedModels = ModelDefinition.allFromCache(cache);

    cachedModels.forEach(function(modelDef) {
      debug('model definition ~ %j', modelDef);
      if (modelDef.readonly) return;
      if (modelDef.facetName === facetName) {
        const modelConfigFile = ModelDefinition.getConfigFile(facetName, modelDef);
        modelConfigFile.data = ModelDefinition.getConfigFromCache(cache, modelDef);
        addFileToSave(modelConfigFile);
      }
    });

    for (const a in Facet.artifactTypes) {
      if (typeof Facet.artifactTypes[a].save === 'function') {
        const artifact = Facet.artifactTypes[a].save(cache, facetName);
        if (artifact) {
          addFileToSave(artifact);
        }
      }
    }

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
  };

  Facet.hasApp = function(facetData) {
    // At the moment, the common facet does not have `app.js`,
    // all other facets (server, client) have their app.js
    // In the future, we should create subclasses of the Facet (ServerFacet,...)
    // and override the value there.
    return facetData.name !== 'common';
  };

  Facet.getUniqueId = function(data) {
    return data.name || null;
  };
}
