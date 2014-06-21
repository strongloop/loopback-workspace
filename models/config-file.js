var assert = require('assert');
var loopback = require('loopback');
var app = require('../app');
var path = require('path');
var async = require('async');
var fs = require('fs-extra');
var models = require('../models.json');
var glob = require('glob');
var ROOT_APP = '.';
var groupBy = require('underscore').groupBy;
var debug = require('debug')('workspace:config-file');

/**
 * Various definitions in the workspace are backed by a `ConfigFile`.
 * This class provides a very simple abstraction from the `fs` module,
 * to make working with config files simpler throughout the workspace.
 * 
 * @property {String} path Workspace relative path to the config file
 * @property {*} data Config data from file. Defaults to `{}`.
 * 
 * @class ConfigFile
 * @inherits Model
 */

var ConfigFile = app.models.ConfigFile;

/**
 * Initialize and save a config file.
 */

ConfigFile.create = function(obj, cb) {
  var configFile = new ConfigFile(obj);
  configFile.save(cb);
}

/**
 * Create and load a `ConfigFile` object with the given path.
 *
 * @param {String} path
 * @callback {Function} callback
 * @param {Error} err
 * @param {ConfigFile} configFile
 */

ConfigFile.loadFromPath = function(path, cb) {
  var configFile = new ConfigFile({
    path: path
  });
  configFile.load(function(err) {
    if(err) return cb(err);
    cb(null, configFile);
  });
}

/**
 * Load and parse the data in the file. If a file does not exist,
 * the `data` property will be null.
 */

ConfigFile.prototype.load = function(cb) {
  var configFile = this;
  if(!this.path) return cb(new Error('no path specified'));
  var absolutePath = ConfigFile.toAbsolutePath(this.path);
  async.waterfall([
    configFile.exists.bind(configFile),
    load,
    setup
  ], cb);

  function load(exists, cb) {
    if(exists) {
      fs.readJson(absolutePath, cb);
    } else {
      cb(null, null);
    }
  }

  function setup(data, cb) {
    debug('loaded [%s] %j', configFile.path, data);
    configFile.data = data || {};
    cb();
  }
}

/**
 * Stringify and save the data to a file.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

ConfigFile.prototype.save = function(cb) {
  var configFile = this;
  if(!this.path) return cb(new Error('no path specified'));
  var absolutePath = configFile.getAbsolutePath();
  configFile.data = configFile.data || {};

  fs.outputJson(absolutePath, configFile.data, cb);
}

/**
 * Remove the file from disk.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

ConfigFile.prototype.remove = function(cb) {
  var configFile = this;
  if(!this.path) return cb(new Error('no path specified'));
  var absolutePath = configFile.getAbsolutePath();

  fs.unlink(absolutePath, cb);
}

/**
 * Does the config file exist at `configFile.path`?
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {Boolean} exists
 */

ConfigFile.prototype.exists = function(cb) {
  fs.exists(this.getAbsolutePath(), function(exists) {
    cb(null, exists);
  });
}

/**
 * Get the path to the workspace directory. First check the env
 * variable `WORKSPACE_DIR`. Otherwise default to `process.cwd()`.
 *
 * @returns {String}
 */

ConfigFile.getWorkspaceDir = function() {
  return process.env.WORKSPACE_DIR || process.cwd();
}

/**
 * Resolve the relative workspace path to a fully qualified
 * absolute file path.
 *
 * @param {String} relativePath
 * @returns {String}
 */

ConfigFile.toAbsolutePath = function(relativePath) {
  return path.join(ConfigFile.getWorkspaceDir(), relativePath);
}

/**
 * See: ConfigFile.getAbsolutePath()
 */

ConfigFile.prototype.getAbsolutePath = function() {
  return ConfigFile.toAbsolutePath(this.path);
}

ConfigFile.find = function(cb) {
  var patterns = [];
  var workspaceDir = this.getWorkspaceDir();
  Object.keys(models).forEach(function(modelName) {
    var model = models[modelName];
    var options = model.options || {};
    if(options.configFiles) {
      patterns = patterns.concat(options.configFiles);
    }
  });

  patterns = patterns.concat(patterns.map(function(pattern) {
    return path.join('*', pattern);
  }));

  async.map(patterns, find, function(err, paths) {
    if(err) return cb(err);

    // flatten paths into single list
    var merged = [];
    merged = merged.concat.apply(merged, paths);

    var configFiles = merged.map(function(filePath) {
      return new ConfigFile({path: filePath});
    });
    cb(null, configFiles);
  });

  function find(pattern, cb) {
    glob(pattern, { cwd: workspaceDir }, cb);
  }
}

ConfigFile.prototype.getExtension = function() {
  return path.extname(this.path);
}

ConfigFile.prototype.getDirName = function() {
  return path.basename(path.dirname(this.path));
}

ConfigFile.prototype.getAppName = function() {
  var dir = this.getDirName();
  var baseDir = this.path.split(path.sep)[0];

  if(dir === ROOT_APP
    || baseDir === this.path
    || baseDir === 'models') {
    return ROOT_APP;
  } else {
    return baseDir;
  }
}

ConfigFile.findAppFiles = function(cb) {
  ConfigFile.find(function(err, configFiles) {
    if(err) return callback(err);

    var result = 
      groupBy(configFiles, function(configFile) {
        return configFile.getAppName();
      });

    cb(null, result);
  });
}

/**
 * Get the filename exlcuding the extension.
 *
 * **Example:**
 *
 * `my-app/my-file.json` => `my-file`
 *
 * @returns {String}
 */

ConfigFile.prototype.getBase = function() {
  return path.basename(this.path, this.getExtension());
}

/**
 * From the given `configFiles`, get the first with a matching `base`
 * (see: `configFile.getBase()`).
 *
 * @returns {ConfigFile}
 */

ConfigFile.getFileByBase = function(configFiles, base) {
  assert(Array.isArray(configFiles));
  var configFile;
  for(var i = 0; i < configFiles.length; i++) {
    configFile = configFiles[i];
    if(configFile && configFile.getBase() === base) {
      return configFile;
    }
  }
  return null;
}

ConfigFile.ROOT_APP = ROOT_APP;
