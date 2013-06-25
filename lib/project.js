/*!
 * TODO: Description.
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('asteroid:Project');
var findit = require('findit');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var render = require('./render');
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

  if (!this.root) {
    throw new Error('Root directory required.');
  }
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
  var operations = [];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  debug('Creating files for a new Project in %s...', root);

  addDirectory(root);
  findit
    .find(TEMPLATE_PATH, { follow_symlinks: true })
    .on('directory', function (dir) {
      addDirectory(
        path.resolve(root, path.relative(TEMPLATE_PATH, dir))
      );
    })
    .on('file', function (file) {
      addFile(
        file,
        path.resolve(root, path.relative(TEMPLATE_PATH, file))
      );
    })
    .on('end', function () {
      async.series(operations, callback && function (err) {
        callback(err, err ? null : new Project({ root: root }));
      });
    });

  return cls;

  function addDirectory(dir) {
    debug('New directory: %s', dir);
    operations.push(function (cbMkdir) {
      mkdirp(dir, cbMkdir);
    });
  }

  function addFile(from, to) {
    debug('New file: %s', to);
    operations.push(function (cbRender) {
      async.waterfall([
        fs.readFile.bind(fs, from, 'utf8'),
        function (template, callback) {
          fs.writeFile(to, render(template, options), callback);
        }
      ], cbRender);
    });
  }
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

/*!
 * Export `Project`.
 */
module.exports = Project;
