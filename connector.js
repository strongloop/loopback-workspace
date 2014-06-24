var app = require('./app');
var connector = app.dataSources.db.connector;
var ComponentDefinition = app.models.ComponentDefinition;
var ConfigFile = app.models.ConfigFile;
var async = require('async');
var debug = require('debug')('workspace:connector');

connector.saveToFile = function() {
  var cb = arguments[arguments.length - 1];
  var cache = connector.cache;

  async.each(ComponentDefinition.allFromCache(cache), function(cachedComponent, cb) {
    ComponentDefinition.saveToFs(cache, cachedComponent, cb);
  }, cb);
}

connector.loadFromFile = function() {
  var cb = arguments[arguments.length - 1];
  
  // reset the cache
  var cacheKeys = Object.keys(connector.cache);
  var cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  ConfigFile.findComponentFiles(function(err, components) {
    if(err) return cb(err);
    var componentNames = Object.keys(components);

    async.each(componentNames, function(component, cb) {
      ComponentDefinition.loadIntoCache(cache, component, components, function(err) {
        if(err) return cb(err);
        // commit the cache
        connector.cache = cache;
        cb();
      });
    }, cb);
  });
}

var originalFind = connector.find;
var originalAll = connector.all;

connector.find = function() {
  var args = arguments;
  var cb = args[args.length - 1];

  connector.loadFromFile(function(err) {
    if(err) return cb(err);
    originalFind.apply(connector, args);
  });
}

connector.all = function() {
  var args = arguments;
  var cb = args[args.length - 1];

  connector.loadFromFile(function(err) {
    if(err) return cb(err);
    originalAll.apply(connector, args);
  });
}
