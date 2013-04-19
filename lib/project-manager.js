/**
 * Expose `ProjectManager`.
 */

module.exports = ProjectManager;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , TaskEmitter = require('task-emitter')
  , debug = require('debug')('asteroid-project-manager')
  , util = require('util')
  , path = require('path')
  , fs = require('fs')
  , path = require('path')
  , inherits = util.inherits
  , assert = require('assert')
  , ASTEROID_PROJECT_DIRECTORY = 'asteroid-projects'
  , PROJECT_CONFIG_FILENAME = 'asteroid.json';
  
/**
 * Create a new `ProjectManager` with the given `options`.
 *
 * @param {Object} options
 * @return {ProjectManager}
 */

function ProjectManager(options) {
  EventEmitter.apply(this, arguments);
  
  // throw an error if args are not supplied
  // assert(typeof options === 'object', 'ProjectManager requires an options object');
  
  this.options = options;
  
  debug('created with options', options);
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(ProjectManager, EventEmitter);

/**
 * Simplified APIs
 */

ProjectManager.create =
ProjectManager.createProjectManager = function () {
  // add simplified construction / sugar here
  return new ProjectManager();
}

var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
ProjectManager.defaultProjectDirectory = path.join(homeDir, ASTEROID_PROJECT_DIRECTORY);

/**
 * Methods.
 */
 
ProjectManager.prototype.listProjects = function (pdir, fn) {
  
  if(typeof pdir === 'function') {
    fn = pdir;
    pdir = ProjectManager.defaultProjectDirectory;
  }
  
  var te = new TaskEmitter();
  var projects = [];
  
  te
    .on('readdir', function (dpath, files) {
      // stat all files
      // if they are in the projects dir
      // or one level in
      if(dpath === pdir || path.dirname(dpath) === pdir) {
        files.forEach(function (file) {
          te.task(fs, 'stat', path.join(dpath, file));
        });
      }
    })
    .on('stat', function (file, stat) {
      if(stat.isDirectory()) {
        te.task(fs, 'readdir', file);
      } else if(path.basename(file) === PROJECT_CONFIG_FILENAME) {
        projects.push(path.basename(path.dirname(file)));
      }
    })
    .on('done', function () {
      fn(null, projects);
    })
    .on('error', fn)
    .task(fs, 'readdir', pdir);
}