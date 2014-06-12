var util = require('util');
var loopback = require('loopback');
var app = require('../app');
var glob = require('glob');
var debug = require('debug')('loopback-workspace:connector');
var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var Memory = require('loopback-datasource-juggler/lib/connectors/memory').Memory;
var WORKSPACE_CONFIG = process.env.WORKSPACE_CONFIG || 'package.json';
var _ = require('underscore');
var groupBy = _.groupBy;

exports.initialize = function initializeDataSource(dataSource, callback) {
  dataSource.connector = new WorkspaceMemory(null, dataSource.settings);
  process.nextTick(function() {
    dataSource.connector.connect(callback);
  });
};

var WorkspaceMemory = Memory; // Memory constructor prevents inheritence

exports.WorkspaceMemory = WorkspaceMemory;

WorkspaceMemory.prototype.loadFromFile = function(callback) {
  var connector = this;

  // get all definition classes
  var definitions = getDefinitions();

  // start with a fresh cache
  var cache = {};

  // preserve existing cache namespaces
  Object.keys(this.cache).forEach(function(modelName) {
    cache[modelName] = {};
  });

  async.waterfall([
    // find apps
    function(cb) {
      WorkspaceMemory.loadConfigFile(WORKSPACE_CONFIG, cb);
    },
    // load all definitions
    function(pkg, cb) {
      if(!pkg) {
        debug('cannot load without a root package.json');
        return callback();
      }

      var apps = pkg.loopback && pkg.loopback.apps;

      if(!apps || !Array.isArray(apps) || !apps.length) {
        return cb(
          new Error(
            'you must include an array of loopback.apps in your package.json'
          )
        );
      }

      // load all definitions
      async.each(apps, function(app, cb) {
        async.each(definitions, function(definition, cb) {
          load.call(connector, app, cache, definition, cb);
        }, cb);
      }, cb);
    }
  ], function(err) {
    if(err) return callback(err);
    connector.cache = cache;
    callback();
  });
};

WorkspaceMemory.prototype.saveToFile = function (result, callback) {
  // get all definition classes
  var definitions = getDefinitions();
  
  // save the cache
  var cache = this.cache;

  // save all definitions
  async.each(definitions, save.bind(this, cache), function(err) {
    if(err) {
      debug('saveToFile error %j', err);
      return callback(err);
    }
    debug('finished saving to file...');
    callback();
  });
};

WorkspaceMemory.loadConfigFile = function(file, cb) {
  debug('loading config file [%s]', file);
  fs.readJson(this.getFullPath(file), function(err, data) {
    if(err && err.code === 'ENOENT') {
      // ignore missing files
      cb(null, null);
    } else if(err) {
      cb(err)
    } else {
      data.configFile = file;
      cb(null, data);
    }
  });
}

WorkspaceMemory.getFullPath = function(file) {
  var root = process.env.WORKSPACE_DIR || process.cwd();
  return path.join(root, file);
}

WorkspaceMemory.saveConfigFile = function(file, data, cb) {
  debug('saving config file [%s]', file);
  fs.outputJson(this.getFullPath(file), data, cb);
}

function getDefinitions() {
  var Definition = app.models.Definition;
  var models = loopback.Model.modelBuilder.models;
  var results = [];
  var model;

  for(var m in models) {
    model = models[m];
    if(model !== Definition && model.prototype instanceof Definition) {
      results.push(model);
    }
  }

  return results;
}

// TODO - handle delete / delete all
// should remove definition.filename()

function load(app, cache, Definition, cb) {
  var debug = require('debug')('loopback-workspace:connector:' + Definition.modelName);
  var connector = this;
  var configFiles = Definition.settings.configFiles;

  // scope configFiles to the app
  configFiles = configFiles.map(function(pattern) {
    return path.join(app, pattern);
  });

  debug('loading data for [%s] in app [%s]', Definition.modelName, app);

  var steps = [
    findFiles,
    loadConfigFiles,
    loadEmbededModels,
    function(cb) {
      debug('finished for [%s]', Definition.modelName);
      cb();
    }
  ];

  async.waterfall(steps, cb);

  function findFiles(cb) {
    async.map(configFiles, glob, cb);
  }

  function loadConfigFiles(files, cb) {
    // flatten list
    var merged = [];
    merged = merged.concat.apply(merged, files);
    async.map(merged, loadFile, cb);
  }

  function loadFile(file, cb) {
    debug('loadFile [%s]', file);
    WorkspaceMemory.loadConfigFile(file, cb);    
  }

  function loadEmbededModels(entities, cb) {
    debug('loading embeded models %j', entities);
    entities.forEach(loadEmbededModel);
    cb();
  }

  function loadEmbededModel(entity) {
    if(!entity) return;
    Definition.getEmbededRelations().forEach(function(relation) {
      addRelatedDataToCache(entity, relation);
    });
  }

  function addRelatedDataToCache(entity, relation) {
    debug('adding related data to cache [%s]', relation.name);
    var data = entity[relation.as];
    data.forEach(addToCache.bind(this, relation.model));
  }

  function addToCache(model, entity) {
    debug('adding to cache [%s]', model);
    var id = connector.getIdValue(model, entity);
    if(!cache[model]) cache[model] = {};
    cache[model][id] = serialize(entity);
  }
}

function save(cache, Definition, cb) {
  debug('saving [%s]', Definition.modelName);
  var connector = this;
  var cachedModels = cache[Definition.modelName] || {};

  var definitions = Object.keys(cachedModels).map(function(id) {
    return new Definition(connector.fromDb(Definition.modelName, cachedModels[id]));
  });

  async.waterfall([
    function(cb) {
      async.map(definitions, Definition.toConfig, cb)
    },
    function(configs, cb) {
      var mergedConfigs = groupAndMergeConfigs(configs);
      async.each(mergedConfigs, saveConfig, cb);
    }
  ], cb);

  function groupAndMergeConfigs(configs) {
    var fileIndex = groupBy(configs, function(config) {
      return config.configFile;
    });
    var files = Object.keys(fileIndex);
    return files.map(function (file) {
      var fileDefs = fileIndex[file];
      var config;

      if(fileDefs.length > 1) {
        config = Definition.mergeConfigs(fileDefs, file);
      } else if(fileDefs.length === 1) {
        config = fileDefs[0];
      } else {
        debug('WARNING no configs for file [%s]', file);
      }

      return config;
    });
  }

  function saveConfig(config, cb) {
    console.log(config);
    WorkspaceMemory.saveConfigFile(config.configFile, config, cb);
  }
}

function serialize(obj) {
  if(obj === null || obj === undefined) {
    return obj;
  }
  return JSON.stringify(obj);
}
