// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const app = require('./server');
const loopback = require('loopback');
const path = require('path');
const connector = app.dataSources.db.connector;
const Facet = app.models.Facet;
const ConfigFile = app.models.ConfigFile;
const PackageDefinition = app.models.PackageDefinition;
const async = require('async');
const debug = require('debug')('workspace:connector');
const EventEmitter = require('events').EventEmitter;
const helper = require('../lib/helper');

connector.writeCallbacks = [];
const debugSync = require('debug')('workspace:connector:save-sync');

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
    const cb = connector.writeCallbacks.shift();
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
    const callbacks = connector.writeCallbacks;
    connector.writeCallbacks = [];

    const cb = function(err) {
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
  const cache = connector.cache;

  const steps = []
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
  const cb = arguments[arguments.length - 1];

  if (connector.writeCallbacks.length) {
    // There is no point in trying to load the files
    // when we are writing new content at the same time
    return cb();
  }

  const recursiveCall = !!connector.loader;

  if (!recursiveCall) {
    connector.loader = new EventEmitter();
    connector.loader.setMaxListeners(100);
  }

  const loader = connector.loader;
  loader.once('complete', cb);
  loader.once('error', cb);

  if (recursiveCall) return;

  const done = function(err) {
    if (err)
      loader.emit('error', err);
    else
      loader.emit('complete');
    connector.loader = null;
  };

  connector._loadFromFile(done);
};

connector._loadFromFile = function(cb) {
  const tasks = [];

  // reset the cache
  const cacheKeys = Object.keys(connector.cache);
  const cache = cacheKeys.reduce(function(prev, cur) {
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

      const facetNames = Object.keys(facetFiles);

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
    const LoopBackConfigFile = getOrCreateLoopBackConfigModel();
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
      let LoopBackConfigFile = loopback.findModel('LoopBackConfigFile');
      if (LoopBackConfigFile) return LoopBackConfigFile;

      LoopBackConfigFile = ConfigFile.extend('LoopBackConfigFile');

      // Override `getWorkspaceDir` to return node_modules/loopback
      LoopBackConfigFile.getWorkspaceDir = function() {
        const workspaceDir = LoopBackConfigFile.base.getWorkspaceDir();
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
        const dir = f.getDirName();
        if (dir !== '.') {
          debug('Skipping package.json in %j', dir);
          return next();
        }

        // TODO(bajtos) Generalize and move this code to WorkspaceEntity
        f.load(function(err) {
          if (err) return next(err);
          PackageDefinition.addToCache(cache, f.data);
          if (dir === '.') {
            let loopBackVersion = undefined;
            const lbVersionSources = [
              'dependencies',
              'devDependencies',
              'optionalDependencies',
            ];

            lbVersionSources.some(function(source) {
              if (source && f.data[source]) {
                loopBackVersion = f.data[source].loopback;
              }

              return loopBackVersion != null;
            });

            app.models.Workspace.loopBackVersion =
              helper.parseLoopBackVersion(loopBackVersion);
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

const originalFind = connector.find;
const originalAll = connector.all;

// Map the model to a collection
connector.getCollection = function(model) {
  const Entity = connector._models[model];
  const meta = Entity.settings[connector.name];
  if (meta) {
    return meta.collection || meta.table || meta.tableName || model;
  }
  return model;
};

connector.find = function(model, id, options, cb) {
  const args = arguments;
  connector.loadFromFile(function(err) {
    if (err) return cb(err);
    if (debug.enabled) {
      const collection = connector.getCollection(model);
      debug('reading from cache %s => %j', collection,
        Object.keys(connector.cache[collection]));
    }
    originalFind.apply(connector, args);
  });
};

connector.all = function(model, filter, options, cb) {
  const args = arguments;
  connector.loadFromFile(function(err) {
    if (err) return cb(err);
    if (debug.enabled) {
      const collection = connector.getCollection(model);
      debug('reading from cache %s => %j', collection,
        Object.keys(connector.cache[collection]));
    }
    originalAll.apply(connector, args);
  });
};

connector.getIdValue = function(model, data) {
  const Entity = loopback.getModel(model);
  const entity = new Entity(data);
  return entity.getUniqueId();
};

connector.create = function create(model, data, options, callback) {
  const Entity = loopback.getModel(model);
  const entity = new Entity(data);
  const id = entity.getUniqueId();

  this.setIdValue(model, data, id);

  const collection = connector.getCollection(model);
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
