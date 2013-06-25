/*!
 * TODO: Description.
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('asteroid:ProjectManager');
var Project = require('./project');
var noop = function () {};

/**
 * Creates a new instance of ProjectManager with the provided `options`.
 *
 * @param {Object} obj
 * @param {String} obj.root A directory containing the set of Projects to manage.
 */
function ProjectManager(obj) {
  if (!(this instanceof ProjectManager)) {
    return new ProjectManager(obj);
  }

  obj = obj || {};

  this.root = obj.root || process.cwd();
}

/**
 * Generates an Array of the names of all managed Projects.
 *
 * @param {Function} callback A Function to call with (err, names).
 * @return {ProjectManager} The ProjectManager instance, for cascading.
 */
ProjectManager.prototype.projects = projects;
function projects(callback) {
  var self = this;

  callback = callback || noop;

  fs.readdir(self.root, function (err, fragments) {
    if (err) {
      // TODO: What are all the errors that could occur here?
      console.error('Error in ProjectManager.prototype.names:');
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
 * @return {ProjectManager} The ProjectManager instance, for cascading.
 */
ProjectManager.prototype.create = create;
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
 * @return {ProjectManager} The ProjectManager instance, for cascading.
 */
ProjectManager.prototype.get = get;
function get(dir, callback) {
  var self = this;
  var root = path.join(self.root, dir);

  Project.isProject(root, function (valid) {
    if (!valid) {
      return callback(new Error('Project at ' + dir + ' does not exist.'));
    }

    callback(null, new Project({
      root: root
    }));
  });

  return self;
}

/*!
 * Export `ProjectManager`.
 */
module.exports = ProjectManager;
