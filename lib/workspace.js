/*!
 * TODO: Description.
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('loopback:Workspace');
var Project = require('./project');
var noop = function () {};

/**
 * Creates a new instance of Workspace with the provided `options`.
 *
 * @param {Object} obj
 * @param {String} obj.root A directory containing the set of Projects to manage.
 */
function Workspace(obj) {
  if (!(this instanceof Workspace)) {
    return new Workspace(obj);
  }

  obj = obj || {};

  this.root = obj.root || process.cwd();

  assert(this.root, 'No root specified.');
}

/**
 * Generates an Array of the names of all managed Projects.
 *
 * @param {Function} callback A Function to call with (err, names).
 * @return {Workspace} The Workspace instance, for cascading.
 */
Workspace.prototype.projects = projects;
function projects(callback) {
  var self = this;

  callback = callback || noop;

  fs.readdir(self.root, function (err, fragments) {
    if (err) {
      // TODO: What are all the errors that could occur here?
      console.error('Error in Workspace.prototype.names:');
      console.error(err.stack || err.message || err);
      fragments = [];
    }

    async.filter(fragments, function (fragment, cbIsProject) {
      Project.isProject(path.join(self.root, fragment), cbIsProject);
    }, function (names) {
      callback(null, names);
    });
  });

  return self;
}

/**
 * Creates a new project at `{root}/{dir}`.
 *
 * @param {String} dir The directory within `root` to place the Project in.
 * @param {Object} options The options to use when generating the new Project files. See `Project.create`.
 * @param {Function} callback A Node-style callback to be called with either an error or a Project instance.
 * @return {Workspace} The Workspace instance, for cascading.
 */
Workspace.prototype.create = create;
function create(dir, options, callback) {
  var self = this;

  Project.create(path.join(self.root, dir), options, callback);

  return self;
}

/**
 * Retrieves a specific Project.
 *
 * @param {String} dir The directory within `root` where the Project resides.
 * @param {Function} callback A Node-style callback to be called with either an error or a Project instance.
 * @return {Workspace} The Workspace instance, for cascading.
 */
Workspace.prototype.get = get;
function get(dir, callback) {
  var self = this;
  var root = path.join(self.root, dir);

  Project.isProject(root, function (valid) {
    if (!valid) {
      return callback(new Error('Project at ' + dir + ' does not exist.'));
    }

    var project = new Project({
      root: root
    });
    project.load(callback);
  });

  return self;
}

/**
 * Synchronously loads an installed ModuleFactory at `name`.
 *
 * @param {String} name The factory to load.
 * @returns {ModuleFactory} A new ModuleFactory instance, or null if the named factory is not installed.
 */
Workspace.prototype.factory = factory;
function factory(name) {
  if (!name) {
    return null;
  }

  try {
    return require(path.join(__dirname, '..', 'factories', name))();
  } catch (e) {
    if (e.message.indexOf('Cannot find module') === -1) {
      throw e;
    }
    return null;
  }
}

/*!
 * Export `Workspace`.
 */
module.exports = Workspace;
