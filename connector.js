var app = require('./app');
var loopback = require('loopback');
var connector = app.dataSources.db.connector;
var Facet = app.models.Facet;
var ConfigFile = app.models.ConfigFile;
var async = require('async');
var debug = require('debug')('workspace:connector');
var EventEmitter = require('events').EventEmitter;

connector.writeCallbacks = [];
var debugSync = require('debug')('workspace:connector:save-sync');

connector.saveToFile = function() {
  var cb = arguments[arguments.length - 1];
  connector.writeCallbacks.push(cb);

  if (connector.writeCallbacks.length == 1) {
    // The first write, nobody else is writing now
    debugSync('write executing');
    connector._saveToFile(saveDone);
  } else {
    debugSync('write scheduled at #%s', connector.writeCallbacks.length-1);
    // wait for the current write to finish
  }

  function saveDone(err) {
    var cb = connector.writeCallbacks.shift();
    debugSync('write finished, %s calls in queue', connector.writeCallbacks.length);
    mergeAndRunPendingWrites();
    cb(err);
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
        debugSync('write finished for #%s', ix+1);
        fn(err);
      });
    };
    cb.internal = true;

    connector.saveToFile(cb);
  }
};

connector._saveToFile = function(cb) {
  var cache = connector.cache;

  async.each(Facet.allFromCache(cache), function(cachedFacet, cb) {
    Facet.saveToFs(cache, cachedFacet, cb);
  }, cb);
}

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

  // reset the cache
  var cacheKeys = Object.keys(connector.cache);
  var cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  ConfigFile.findFacetFiles(function(err, facetFiles) {
    if(err) return done(err);

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
        if(err) {
          return next(err);
        }
        // commit the cache
        connector.cache = cache;
        if(debug.enabled) {
          Object.keys(cache).forEach(function(model) {
            debug('setting cache %s => %j', model, Object.keys(cache[model]));
          });
        }
        next();
      });
    }, done);
  });
}

var originalFind = connector.find;
var originalAll = connector.all;

connector.find = function(model) {
  var args = arguments;
  var cb = args[args.length - 1];
  connector.loadFromFile(function(err) {
    if(err) return cb(err);
    debug('reading from cache %s => %j', model, Object.keys(connector.cache[model]));
    originalFind.apply(connector, args);
  });
}

connector.all = function(model) {
  var args = arguments;
  var cb = args[args.length - 1];
  connector.loadFromFile(function(err) {
    if(err) return cb(err);
    debug('reading from cache %s => %j', model, Object.keys(connector.cache[model]));
    originalAll.apply(connector, args);
  });
}

connector.getIdValue = function(model, data) {
  var Entity = loopback.getModel(model);
  var entity = new Entity(data);
  return entity.getUniqueId();
}

connector.create = function create(model, data, callback) {
  var Entity = loopback.getModel(model);
  var entity = new Entity(data);
  var id = entity.getUniqueId();

  this.setIdValue(model, data, id);

  if(!this.cache[model]) {
    this.cache[model] = {};
  }

  this.cache[model][id] = serialize(data);
  this.saveToFile(id, function(err) {
    if(err) return callback(err);
    callback(null, id);
  });
};

function serialize(obj) {
  if(obj === null || obj === undefined) {
    return obj;
  }
  return JSON.stringify(obj);
}
