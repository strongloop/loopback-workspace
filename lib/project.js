/**
 * Expose `Project`.
 */

module.exports = Project;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , TaskEmitter = require('task-emitter')
  , fs = require('fs')
  , ProjectConfig = require('./project-config')
  , path = require('path')
  , ConfigLoader = require('asteroid-config-loader')
  , debug = require('debug')('project')
  , util = require('util')
  , inherits = util.inherits
  , ProjectManager = require('./project-manager')
  , assert = require('assert');
  
/**
 * Create a new `Project` with the given `options`.
 *
 * @param {Object} options
 * @return {Project}
 */

function Project(options) {
  EventEmitter.apply(this, arguments);
  
  // throw an error if args are not supplied
  assert(typeof options === 'object', 'Project requires an options object');
  assert(options.name || options.dir, 'Project options must include name or dir');
  
  this.options = options;
  
  this.dir = options.dir || path.join(ProjectManager.defaultProjectDirectory, options.name);
  
  debug('created with options', options);
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(Project, EventEmitter);

/**
 * Load project files
 */
 
Project.prototype.files = function (fn) {
  var te = new TaskEmitter();
  var results = {};
  var dir = this.dir;
  
  te
    .on('readdir', function (dpath, files) {
      files.forEach(function (file) {
        te.task(fs, 'stat', path.join(dpath, file));
      });
    })
    .on('stat', function (file, stat) {
      if(stat.isDirectory()) {
        te.task(fs, 'readdir', file);
      } else {
        results[path.relative(dir, file)] = stat;
      }
    })
    .on('done', function () {
      fn(null, results);
    })
    .on('error', fn)
    .task(fs, 'readdir', dir);
}

/**
 * Load the config from a project.
 */

Project.prototype.getConfig = function (fn) {
  var opts = {ttl: 0};
  var dir = this.dir;
  var cl = ConfigLoader.create(dir, opts);
  
  cl.load(function (err, config) {
    if(err) {
      fn(err);
    } else {
      fn(null, new ProjectConfig(config, dir, dir));
    }
  });
}