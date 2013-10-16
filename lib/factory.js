/*!
 * Dependencies.
 */
var assert = require('assert');
var Generator = require('strong-generator');
var fs = require('fs');
var async = require('async');
var path = require('path');
var _ = require('underscore');
var stringUtils = require('underscore.string');

/**
 * Creates a new instance of ModuleFactory.
 */
function ModuleFactory(root, source) {
  if (!(this instanceof ModuleFactory)) {
    return new ModuleFactory(root, source);
  }
  
  assert(typeof root === 'string', this.constructor.name + 
        ' must call ModuleFactory with a root');
  assert(source, this.constructor.name + 
        ' must call ModuleFactory with __dirname');
  this.root = root;
  this.source = source;
  this.template = path.join(source, 'template');
}

ModuleFactory.prototype.create = function (options, callback) {
  var Ctor = this.constructor;
  var root = this.root;
  var factory = this;
  var defaults = Ctor.defaults || {};
  
  factory.exists(function (exists) {
    if(exists) {
      callback(new Error(root + ' already exists'));
    } else {
      options = _.defaults(options, defaults);
      async.waterfall([
        function (callback) {
          factory.render(options, callback);
        },
        function (callback) {
          factory.setOptions(options, callback);
        }
      ], callback);
    }
  });
}

ModuleFactory.prototype.exists = function (callback) {
  fs.exists(this.root, callback);
}

/**
 * Synchronously loads an installed ModuleFactory at `name`.
 *
 * @param {String} name The factory to load.
 * @returns {ModuleFactory} A new ModuleFactory instance, or null if the named
 * factory is not installed.
 */
ModuleFactory.factory = factory;
function factory(name, root) {
  if (!name) {
    return null;
  }

  try {
    return require(path.join(__dirname, '..', 'factories', name))(root);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw e;
    }
    return null;
  }
}

/**
 * The built-in template renderer exposed for subclasses.
 *
 * @type {Renderer}
 */
ModuleFactory.prototype.renderer = new Generator();

/**
 * Renders a new Module instance at `root`.
 *
 * @param {String} root The root directory to render to.
 * @param {Object} options The options to use while rendering
 * @param {Function} callback An error-only callback.
 * @returns {ModuleFactory} The ModuleFactory instance, for cascading.
 */
ModuleFactory.prototype.render = render;
function render(options, callback) {
  this.renderer.renderAll(this.template, this.root, this.toJavaScript(options),
  function (err) {
    callback(err);
  });
}

ModuleFactory.prototype.toJavaScript = toJavaScript;
function toJavaScript(options) {
  var cloned = _.clone(options);
  
  if(typeof cloned.name === 'string') {
    cloned.className = stringUtils.classify(cloned.name);
    cloned.dashedName = stringUtils.dasherize(cloned.name);
  }
  
  return cloned;
}

/**
 * Returns a package.json-compatible description of rendered Modules' dependencies.
 *
 * @returns {Object} An Object to be serialized and added as dependencies.
 */
ModuleFactory.prototype.dependencies = dependencies;
function dependencies() {
  // TODO: This structure for declaring dependencies doesn't allow for modules to require conflicting versions of a
  // dependency. We should look into more complex modules receiving their own package.json file.
  return {};
}

ModuleFactory.prototype.setOptions = setOptions;
function setOptions(options, callback) {
  var factory = this;
  var merged;
  
  this.getOptions(function (err, current) {
    if(err) {
      callback(err);
    } else {
      try {
        merged = JSON.stringify(_.extend(current, options));
      } catch(e) {
        return callback(e);
      }
      
      fs.writeFile(factory.getOptionsFilePath(), merged, 'utf8', callback);
    }
  });
}

ModuleFactory.prototype.getOptions = getOptions;
function getOptions(callback) {
  var options;
  var self = this;
  fs.readFile(this.getOptionsFilePath(), 'utf8', function (err, str) {
    if(err) {
      if(err.code === 'ENOENT') {
        return callback(null, {});
      }
      callback(err);
    } else if(str.replace(' ', '')) {
      try {
        options = JSON.parse(str);
      } catch(e) {
        return callback(e);
      }
      
      callback(null, options);
    } else {
      callback(null, {});
    }
  });
}

ModuleFactory.prototype.getOptionsFilePath = getOptionsFilePath;
function getOptionsFilePath() {
  return path.join(this.root, 'module.json');
}

/*!
 * Export `ModuleFactory`.
 */
module.exports = ModuleFactory;
