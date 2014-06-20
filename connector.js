var app = require('./app');
var connector = app.dataSources.db.connector;
var AppDefinition = app.models.AppDefinition;
var ConfigFile = app.models.ConfigFile;
var async = require('async');

connector.saveToFile = function() {
  console.log('saveToFs');
  var cb = arguments[arguments.length - 1];
  async.each(AppDefinition.allFromCache(), function(cachedApp, cb) {
    AppDefinition.saveToFs(cachedApp, cb);
  }, cb);
}

connector.loadFromFile = function() {
  var cb = arguments[arguments.length - 1];
  
  // reset the cache
  // TODO(ritch) this could cause race conditions - below is async
  var cacheKeys = Object.keys(connector.cache);
  connector.cache = cacheKeys.reduce(function(prev, cur) {
    prev[cur] = {};
    return prev;
  }, {});

  ConfigFile.findAppFiles(function(err, apps) {
    if(err) return cb(err);
    var appNames = Object.keys(apps);

    async.each(appNames, function(app, cb) {
      AppDefinition.loadIntoCache(app, apps, cb);
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

connector.all = function(err) {
  var args = arguments;
  var cb = args[args.length - 1];

  connector.loadFromFile(function() {
    if(err) return cb(err);
    console.log('cb');
    originalAll.apply(connector, args);
  });
}
