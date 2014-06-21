var app = require('./app');
var connector = app.dataSources.db.connector;
var AppDefinition = app.models.AppDefinition;
var ConfigFile = app.models.ConfigFile;
var async = require('async');
var debug = require('debug')('workspace:connector');

connector.saveToFile = function() {
  var cb = arguments[arguments.length - 1];
  var cache = connector.cache;

  async.each(AppDefinition.allFromCache(cache), function(cachedApp, cb) {
    AppDefinition.saveToFs(cache, cachedApp, cb);
  }, cb);
}

connector.loadFromFile = function() {
  var cb = arguments[arguments.length - 1];
  
  // reset the cache
  // TODO(ritch) this could cause race conditions - below is async
  var cacheKeys = Object.keys(connector.cache);
  var cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  ConfigFile.findAppFiles(function(err, apps) {
    if(err) return cb(err);
    var appNames = Object.keys(apps);

    async.each(appNames, function(app, cb) {
      AppDefinition.loadIntoCache(cache, app, apps, function(err) {
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
