/*!
 * TODO: Description.
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('asteroid:Project');
var rimraf = require('rimraf');
var renderer = require('./renderer');
var TEMPLATE_PATH = path.join(__dirname, '..', 'data', 'project-template');

/**
 * Creates a new instance of Project with the provided `options`.
 *
 * @param {Object} options
 * @param {String} options.root The Project's root directory.
 */
function Project(options) {
  if (!(this instanceof Project)) {
    return new Project(options);
  }

  options = options || {};

  this.root = options.root;
  this.name = options.name;
  this.description = options.description;

  assert(this.root, 'No root specified.');
}

/**
 * Tests for the existence of files to consider `root` as a Project's root directory.
 *
 * @param {String} root A fully-qualified path to the root directory to test.
 * @param {Function} callback A callback Function accepting _one parameter_, a Boolean. This is in keeping with Node's
 *                            truth tests, like `fs.exists`.
 * @returns {Function} The Project class, for cascading.
 */
Project.isProject = isProject;
function isProject(root, callback) {
  var cls = this;

  async.every([
    root,
    path.join(root, 'package.json'),
    path.join(root, 'app.js')
  ], fs.exists, callback);

  return cls;
}

/**
 * Creates boilerplate files within `root`, making it a legal Project. Any non-Project files within `root` will be
 * preserved, but all Project-specific files (e.g. app.js) will be overwritten.
 *
 * @param {String} root A fully-qualified path to the root directory to fill.
 * @param {Object} options Options for rendering the initial boilerplate.
 * @param {Function} callback A Node-style callback Function to be called with either an error or the new Project
 *                            instance.
 * @returns {Function} The Project class, for cascading.
 */
Project.create = create;
function create(root, options, callback) {
  var cls = this;

  debug('Rendering a new Project in %s...', root);

  renderer.renderAll(TEMPLATE_PATH, root, options, function (err) {
    callback(err, err ? null : new Project({
      root: root,
      name: options.name,
      description: options.description
    }));
  });

  return cls;
}

/**
 * Loads metadata from the existing Project.
 *
 * @param {Function} callback A Node-style callback to be called with either an Error or the Project instance.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.load = load;
function load(callback) {
  var self = this;

  fs.readFile(path.join(self.root, 'package.json'), 'utf8', function (err, json) {
    var meta;

    try {
      meta = JSON.parse(json);
    } catch (e) {
      return callback(e);
    }

    self.name = meta.name;
    self.description = meta.description;

    callback(null, self);
  });

  return self;
}

/**
 * Removes the Project from the filesystem. If there are other files mixed in with the Project (e.g. files that existed
 * when `create` was called), _those will be deleted!_
 *
 * @param {Function} callback An error-only callback.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.remove = remove;
function remove(callback) {
  var self = this;

  // TODO: More validation.
  // TODO: Can we be more selective?
  rimraf(self.root, callback);

  return self;
}

/**
 * Adds a new instance of `factory` as a Module at `dir`.
 *
 * @param {ModuleFactory} factory The factory to use for rendering the new Module instance.
 * @param {String} dir The directory within `modules` to place the new Module in.
 * @param {Object} options The options to use while rendering the Module instance.
 * @param {Function} callback An error-only callback.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.addModule = addModule;
function addModule(factory, dir, options, callback) {
  var self = this;

  factory.render(path.join(self.root, 'modules', dir), options, callback);

  async.waterfall([
    fs.readFile.bind(fs, path.join(self.root, 'package.json'), 'utf8'),
    function (json, cbMerge) {
      var obj = JSON.parse(json);
      var deps = factory.dependencies();

      if (!obj.dependencies) {
        obj.dependencies = {};
      }

      Object.keys(deps).forEach(function (name) {
        obj.dependencies[name] = deps[name];
      });

      cbMerge(null, JSON.stringify(obj, null, 2));
    },
    fs.writeFile.bind(fs, path.join(self.root, 'package.json'))
  ], callback);

  return self;
}

/**
 * Removes the Module from the filesystem. If there are other files mixed in with the Module, _those will be deleted!_
 *
 * @param {Function} callback An error-only callback.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.removeModule = removeModule;
function removeModule(dir, callback) {
  var self = this;

  // TODO: More validation.
  // TODO: Can we be more selective?
  rimraf(path.join(self.root, 'modules', dir), callback);

  return self;
}

/**
 * Returns a JSON representation of this Project.
 */
Project.prototype.toJSON = toJSON;
function toJSON() {
  var self = this;

  return {
    name: self.name,
    description: self.description
  };
}

/*!
 * Export `Project`.
 */
module.exports = Project;
