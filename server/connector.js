// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('./server');
var loopback = require('loopback');
var path = require('path');
var connector = app.dataSources.db.connector;
var Facet = app.models.Facet;
var ConfigFile = app.models.ConfigFile;
var PackageDefinition = app.models.PackageDefinition;
var async = require('async');
var debug = require('debug')('workspace:connector');
var EventEmitter = require('events').EventEmitter;

connector.writeCallbacks = [];
var debugSync = require('debug')('workspace:connector:save-sync');

connector.saveToFile = function(result, callback) {
  connector.writeCallbacks.push(function(err) {
    callback(err, result);
  });

  if (connector.writeCallbacks.length === 1) {
    // The first write, nobody else is writing now
    debugSync('write executing');
    connector._saveToFile(saveDone);
  } else {
    debugSync('write scheduled at #%s', connector.writeCallbacks.length - 1);
    // wait for the current write to finish
  }

  function saveDone(err) {
    var cb = connector.writeCallbacks.shift();
    debugSync('write finished, %s calls in queue', connector.writeCallbacks.length);
    mergeAndRunPendingWrites();
    cb(err, result);
  }

  function mergeAndRunPendingWrites() {
    if (connector.writeCallbacks.length === 0) {
      // No more pending writes - we are done
      debugSync('all writes were finished');
      return;
    }

    // merge all pending writes into a single one.
    var callbacks = connector.writeCallbacks;
    connector.writeCallbacks = [];

    var cb = function(err) {
      callbacks.forEach(function(fn, ix) {
        debugSync('write finished for #%s', ix + 1);
        fn(err);
      });
    };
    cb.internal = true;

    connector.saveToFile(null, cb);
  }
};

connector._saveToFile = function(cb) {
  var cache = connector.cache;

  var steps = []
    .concat(saveAll(Facet))
    .concat(saveAll(PackageDefinition));

  async.parallel(steps, cb);

  function saveAll(Entity) {
    return Entity.allFromCache(cache).map(function(cachedData) {
      return function(next) {
        Entity.saveToFs(cache, cachedData, next);
      };
    });
  }
};

connector.loadFromFile = function() {
  var cb = arguments[arguments.length - 1];

  if (connector.writeCallbacks.length) {
    // There is no point in trying to load the files
    // when we are writing new content at the same time
    return cb();
  }

  var recursiveCall = !!connector.loader;

  if (!recursiveCall) {
    connector.loader = new EventEmitter();
    connector.loader.setMaxListeners(100);
  }

  var loader = connector.loader;
  loader.once('complete', cb);
  loader.once('error', cb);

  if (recursiveCall) return;

  var done = function(err) {
    if (err)
      loader.emit('error', err);
    else
      loader.emit('complete');
    connector.loader = null;
  };

  connector._loadFromFile(done);
};

connector._loadFromFile = function(cb) {
  var tasks = [];

  // reset the cache
  var cacheKeys = Object.keys(connector.cache);
  var cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  tasks.push(function(done) {
    ConfigFile.findFacetFiles(function(err, facetFiles) {
      if (err) return done(err);

      if (!('common' in facetFiles) && (facetFiles.server || facetFiles.common)) {
        // When there are no model defined in `common` facet,
        // ConfigFile does not recognize it.
        // Workaround - add the facet explicitly, but only if there are other
        // facets like "server" already present.
        facetFiles.common = [];
      }

      var facetNames = Object.keys(facetFiles);

      async.each(facetNames, function(facet, next) {
        Facet.loadIntoCache(cache, facet, facetFiles, function(err) {
          if (err) {
            return next(err);
          }
          commit();
          next();
        });
      }, done);
    });
  });

  tasks.push(function loadLoopBackModels(done) {
    // NOTE(bajtos) a short-term solution for loading loopback models
    // It should be replaced by a full-fledged component-loader soon,
    // see https://github.com/strongloop/loopback-workspace/issues/159
    var LoopBackConfigFile = getOrCreateLoopBackConfigModel();
    LoopBackConfigFile.findFacetFiles(function(err, loopbackFiles) {
      if (err) return done(err);
      if (!loopbackFiles.common) return done();

      Facet.loadIntoCache(cache, 'common', loopbackFiles, function(err) {
        if (err) return done(err);
        commit();
        done();
      });
    });

    function getOrCreateLoopBackConfigModel() {
      var LoopBackConfigFile = loopback.findModel('LoopBackConfigFile');
      if (LoopBackConfigFile) return LoopBackConfigFile;

      LoopBackConfigFile = ConfigFile.extend('LoopBackConfigFile');

      // Override `getWorkspaceDir` to return node_modules/loopback
      LoopBackConfigFile.getWorkspaceDir = function() {
        var workspaceDir = LoopBackConfigFile.base.getWorkspaceDir();
        return path.join(workspaceDir, 'node_modules', 'loopback');
      };

      // Override `isReadOnly` to be always `true`
      Object.defineProperty(LoopBackConfigFile.prototype, 'isReadOnly', {
        value: true,
      });

      return LoopBackConfigFile;
    }
  });

  tasks.push(function(done) {
    ConfigFile.findPackageDefinitions(function(err, files) {
      if (err) return done(err);
      async.each(files, function(f, next) {
        var dir = f.getDirName();
        if (dir !== '.') {
          debug('Skipping package.json in %j', dir);
          return next();
        }

        // TODO(bajtos) Generalize and move this code to WorkspaceEntity
        f.load(function(err) {
          if (err) return next(err);
          PackageDefinition.addToCache(cache, f.data);
          if (dir === '.') {
            var loopBackVersion = f.data.dependencies['loopback'] ||
              f.data.devDependencies['loopback'] ||
              f.data.optionalDependencies['loopback'];
            app.models.Workspace.loopBackVersion = loopBackVersion;
          }
          next();
        });
      }, function(err) {
        if (err) {
          return done(err);
        }
        commit();
        done();
      });
    });
  });

  async.parallel(tasks, cb);

  function commit() {
    // commit the cache
    connector.cache = cache;
    if (debug.enabled) {
      Object.keys(cache).forEach(function(model) {
        debug('setting cache %s => %j', model, Object.keys(cache[model]));
      });
    }
  }
};

var originalFind = connector.find;
var originalAll = connector.all;

// Map the model to a collection
connector.getCollection = function(model) {
  var Entity = connector._models[model];
  var meta = Entity.settings[connector.name];
  if (meta) {
    return meta.collection || meta.table || meta.tableName || model;
  }
  return model;
};

connector.find = function(model, id, options, cb) {
  var args = arguments;
  connector.loadFromFile(function(err) {
    if (err) return cb(err);
    if (debug.enabled) {
      var collection = connector.getCollection(model);
      debug('reading from cache %s => %j', collection,
        Object.keys(connector.cache[collection]));
    }
    originalFind.apply(connector, args);
  });
};

connector.all = function(model, filter, options, cb) {
  var args = arguments;
  connector.loadFromFile(function(err) {
    if (err) return cb(err);
    if (debug.enabled) {
      var collection = connector.getCollection(model);
      debug('reading from cache %s => %j', collection,
        Object.keys(connector.cache[collection]));
    }
    originalAll.apply(connector, args);
  });
};

connector.getIdValue = function(model, data) {
  var Entity = loopback.getModel(model);
  var entity = new Entity(data);
  return entity.getUniqueId();
};

connector.create = function create(model, data, options, callback) {
  var Entity = loopback.getModel(model);
  var entity = new Entity(data);
  var id = entity.getUniqueId();

  this.setIdValue(model, data, id);

  var collection = connector.getCollection(model);
  if (!this.cache[collection]) {
    this.cache[collection] = {};
  }

  this.cache[collection][id] = serialize(data);
  this.saveToFile(id, function(err) {
    if (err) return callback(err);
    callback(null, id);
  });
};

function serialize(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  return JSON.stringify(obj);
}
