// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const g = require('strong-globalize')();

module.exports = function(ConfigFile) {
  const assert = require('assert');
  const app = require('../../server/server');
  const path = require('path');
  const async = require('async');
  const fs = require('fs-extra');
  const glob = require('glob');
  const ROOT_COMPONENT = '.';
  const groupBy = require('lodash').groupBy;
  const debug = require('debug')('workspace:config-file');

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

  /**
   * Initialize and save a config file.
   */

  ConfigFile.create = function(obj, cb) {
    const configFile = new ConfigFile(obj);
    configFile.save(cb);
  };

  /**
   * Create and load a `ConfigFile` object with the given path.
   *
   * @param {String} path
   * @callback {Function} callback
   * @param {Error} err
   * @param {ConfigFile} configFile
   */

  ConfigFile.loadFromPath = function(path, cb) {
    const configFile = new ConfigFile({
      path: path,
    });
    configFile.load(function(err) {
      if (err) return cb(err);
      cb(null, configFile);
    });
  };

  /**
   * Load and parse the data in the file. If a file does not exist,
   * the `data` property will be null.
   */

  ConfigFile.prototype.load = function(cb) {
    const configFile = this;
    if (!this.path) return cb(new Error(g.f('no path specified')));
    const absolutePath = configFile.constructor.toAbsolutePath(this.path);
    async.waterfall([
      configFile.exists.bind(configFile),
      load,
      setup,
    ], cb);

    function load(exists, cb) {
      if (exists) {
        fs.readJson(absolutePath, function(err, data) {
          if (err && err.name === 'SyntaxError') {
            err.message = g.f('Cannot parse %s: %s', configFile.path, err.message);
          }
          cb(err, err ? undefined : data);
        });
      } else {
        cb(null, null);
      }
    }

    function setup(data, cb) {
      debug('loaded [%s] %j', configFile.path, data);
      configFile.data = data || {};
      cb();
    }
  };

  /**
   * Stringify and save the data to a file.
   *
   * @callback {Function} callback
   * @param {Error} err
   */

  ConfigFile.prototype.save = function(cb) {
    const configFile = this;
    if (!this.path) return cb(new Error(g.f('no path specified')));
    const absolutePath = configFile.getAbsolutePath();
    configFile.data = configFile.data || {};

    debug('output [%s] %j', absolutePath, configFile.data);
    fs.mkdirp(path.dirname(absolutePath), function(err) {
      if (err) return cb(err);
      fs.writeJson(absolutePath, configFile.data, {spaces: '  '}, cb);
    });
  };

  /**
   * Remove the file from disk.
   *
   * @callback {Function} callback
   * @param {Error} err
   */

  ConfigFile.prototype.remove = function(cb) {
    const configFile = this;
    if (!this.path) return cb(new Error(g.f('no path specified')));
    const absolutePath = configFile.getAbsolutePath();

    fs.unlink(absolutePath, cb);
  };

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
  };

  /**
   * Get the path to the workspace directory. First check the env
   * variable `WORKSPACE_DIR`. Otherwise default to `process.cwd()`.
   *
   * @returns {String}
   */

  ConfigFile.getWorkspaceDir = function() {
    return process.env.WORKSPACE_DIR || process.cwd();
  };

  /**
   * Resolve the relative workspace path to a fully qualified
   * absolute file path.
   *
   * @param {String} relativePath
   * @returns {String}
   */

  ConfigFile.toAbsolutePath = function(relativePath) {
    return path.join(this.getWorkspaceDir(), relativePath);
  };

  /**
   * See: ConfigFile.getAbsolutePath()
   */

  ConfigFile.prototype.getAbsolutePath = function() {
    return this.constructor.toAbsolutePath(this.path);
  };

  ConfigFile.find = function(entityFilter, cb) {
    const Ctor = this;
    const models = app.models();

    if (!cb) {
      cb = entityFilter;
      entityFilter = function() { return true; };
    }

    let patterns = [];
    const workspaceDir = this.getWorkspaceDir();
    models.forEach(function(Model) {
      if (!entityFilter(Model.modelName, Model.definition)) return;
      const options = Model.settings || {};
      if (options.configFiles) {
        patterns = patterns.concat(options.configFiles);
      }
    });

    patterns = patterns.concat(patterns.map(function(pattern) {
      return path.join('*', pattern);
    }));

    async.map(patterns, find, function(err, paths) {
      if (err) return cb(err);

      // flatten paths into single list
      let merged = [];
      merged = merged.concat.apply(merged, paths);

      const configFiles = merged.map(function(filePath) {
        return new Ctor({path: filePath});
      });
      cb(null, configFiles);
    });

    function find(pattern, cb) {
      // set strict to false to avoid perm issues
      glob(pattern, {cwd: workspaceDir, strict: false}, cb);
    }
  };

  ConfigFile.prototype.getExtension = function() {
    return path.extname(this.path);
  };

  ConfigFile.prototype.getDirName = function() {
    return path.basename(path.dirname(this.path));
  };

  ConfigFile.prototype.getFacetName = function() {
    const dir = this.getDirName();
    // NOTE: glob always returns the path using forward-slash even on Windows
    // See: https://github.com/strongloop/generator-loopback/issues/12
    const baseDir = this.path.split('/')[0];

    const isRootComponent = dir === ROOT_COMPONENT ||
      baseDir === this.path ||
      baseDir === 'models';

    const facetName = isRootComponent ? ROOT_COMPONENT : baseDir;

    return facetName;
  };

  ConfigFile.findFacetFiles = function(cb) {
    this.find(entityBelongsToFacet, function(err, configFiles) {
      if (err) return cb(err);

      const result =
        groupBy(configFiles, function(configFile) {
          return configFile.getFacetName();
        });

      cb(null, result);
    });
  };

  function entityBelongsToFacet(name, definition) {
    return definition && definition.properties &&
      definition.properties.facetName;
  }

  ConfigFile.findPackageDefinitions = function(cb) {
    this.find(
      function(name/* , definition */) { return name === 'PackageDefinition'; },
      cb,
    );
  };

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
  };

  /**
   * From the given `configFiles`, get the first with a matching `base`
   * (see: `configFile.getBase()`).
   *
   * @returns {ConfigFile}
   */

  ConfigFile.getFileByBase = function(configFiles, base) {
    assert(Array.isArray(configFiles));
    let configFile;
    for (let i = 0; i < configFiles.length; i++) {
      configFile = configFiles[i];
      if (configFile && configFile.getBase() === base) {
        return configFile;
      }
    }
    return null;
  };

  /**
   * From the given `configFiles`, get an array of files that represent
   * `ModelDefinition`s.
   *
   * @returns {ConfigFile[]}
   */

  ConfigFile.getModelDefFiles = function(configFiles, facetName) {
    assert(Array.isArray(configFiles));
    let configFile;
    const results = [];
    for (let i = 0; i < configFiles.length; i++) {
      configFile = configFiles[i];
      // TODO(ritch) support other directories
      if (configFile && configFile.getFacetName() === facetName &&
          configFile.getDirName() === 'models') {
        results.push(configFile);
      }
    }
    return results;
  };

  ConfigFile.ROOT_COMPONENT = ROOT_COMPONENT;
};
