var path = require('path');
var app = require('../app');
var fs = require('fs');

/**
 * Defines a `LoopBackApp` configuration.
 * @class AppDefinition
 * @inherits Definition
 */

var AppDefinition = app.models.AppDefinition;

/**
 * Does the given `app` exist on disk as a directory?
 *
 * @param {AppDefinition} app
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.exists = function(app, cb) {
  app.exists(cb);
}

/**
 * Does the given `app` exist on disk as a directory?
 *
 * @param {AppDefinition} app
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.prototype.exists = function(cb) {
  fs.stat(this.getDir(), function(err, stat) {
    if(err) return cb(err);
    cb(null, stat.isDirectory());
  });
}

AppDefinition.prototype.getAppDir = function() {
  return this.name;
}

AppDefinition.isValidDir = function(dir) {
  // contains:
  // models.json
  // datasources.json
}

AppDefinition.populateCacheFromConfig = function(config, cb) {
  AppDefinition.addToCache(config.dir, config);
  cb();
}

AppDefinition.loadDefinitionsFromFs = function() {
  // find apps in the workspace
  async.waterfall([
    AppDefinition.findAppDirs,
    loadAppConfigs,
    cacheAppConfigs
  ]);

  function loadAppConfigs(appDirs, cb) {
    async.map(appDirs, loadAppConfig, cb);
  }

  function loadAppConfig(dir, cb) {
    var file = path.join(dir, 'app.json');
    AppDefinition.loadFile(file, function(err, config) {
      if(err) return cb(err);
      if(config) {
        config.configFile = file;
      } else {
        config = {};
      }
      config.dir = dir;
      cb(null, config);
    });
  }

  function cacheAppConfigs(configs, cb) {
    for (var i = configs.length - 1; i >= 0; i--) {
      var config = configs[i];

    };
  }
}

AppDefinition.saveToFs = function(apps) {
  // convert each app to JSON for app.json
  // save changes to $dir/app.json
}
