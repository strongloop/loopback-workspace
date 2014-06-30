var app = require('./app');
var connector = app.dataSources.db.connector;
var ComponentDefinition = app.models.ComponentDefinition;
var ConfigFile = app.models.ConfigFile;
var async = require('async');
var debug = require('debug')('workspace:connector');
var EventEmitter = require('events').EventEmitter;

connector.saveToFile = function() {
  var cb = arguments[arguments.length - 1];
  var cache = connector.cache;

  async.each(ComponentDefinition.allFromCache(cache), function(cachedComponent, cb) {
    ComponentDefinition.saveToFs(cache, cachedComponent, cb);
  }, cb);
}

connector.loadFromFile = function() {
  var cb = arguments[arguments.length - 1];
  var loader = connector.loader;

  if(loader) {
    loader.once('complete', cb);
    loader.once('error', cb);
    return;
  }

  loader = connector.loader = new EventEmitter();
  var done = function(err) {
    if (err)
      loader.emit('error', err);
    else
      loader.emit('complete');
    cb(err);
  };

  // reset the cache
  var cacheKeys = Object.keys(connector.cache);
  var cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  ConfigFile.findComponentFiles(function(err, components) {
    if(err) return done(err);
    var componentNames = Object.keys(components);

    async.each(componentNames, function(component, next) {
      ComponentDefinition.loadIntoCache(cache, component, components, function(err) {
        if(err) {
          return next(err);
        }
        // commit the cache
        connector.cache = cache;
        connector.loader = null;
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
