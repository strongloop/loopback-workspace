/*!
 * TODO: Description.
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('loopback:Project');
var rimraf = require('rimraf');
var generator = require('strong-generator').createGenerator();
var ModuleFactory = require('./factory');
var ProjectFactory = require('../factories/project');

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
  this.modules = [];

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
 * Tests for the existence of files to consider `root` as a Module.
 *
 * @param {String} root A fully-qualified path to the root directory to test.
 * @param {Function} callback A callback Function accepting _one parameter_, a Boolean. This is in keeping with Node's
 *                            truth tests, like `fs.exists`.
 * @returns {Function} The Project class, for cascading.
 */
Project.isModule = isModule;
function isModule(root, callback) {
  var cls = this;

  debug('Checking module-ness of %s...', root);

  async.every([
    root,
    path.join(root, 'module.json')
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
  var template = options.template || 'mobile';
  var templateData;
  var project = new Project({
    root: root,
    name: options.name,
    description: options.description
  });
  
  try {
    templateData = require('../templates/' + template);
  } catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') {
      e = new Error('template ' + template + ' does not exist');
    }
    return callback(e);
  }

  debug('Rendering a new Project in %s...', root);
  
  async.waterfall([
    function (callback) {
      project.renderBoilerplate(callback);
    },
    function (callback) {
      project.renderTemplate(templateData, callback);
    }
  ], function (err) {
    if(err) {
      return callback(err);
    } else {
      callback(null, project);
    }
  });

  return cls;
}

Project.prototype.renderBoilerplate = renderBoilerplate;
function renderBoilerplate(callback) {
  var projectFactory = new ProjectFactory(this.root);
  
  projectFactory.render(this, function (err) {
    callback(err);
  });
}

Project.prototype.renderTemplate = renderTemplate;
function renderTemplate(templateData, callback) {
  var project = this;
  var modules = templateData.modules;
  var ops = [];
  
  assert(typeof templateData === 'object');
  assert(typeof templateData.modules === 'object');
  
  Object.keys(modules).forEach(function (moduleName) {
    ops.push(function (callback) {
      var moduleInfo = modules[moduleName];
      var dir = moduleName;
      var options = moduleInfo;
      
      project.addModule(moduleInfo.type, dir, options, callback);
    });
  });
  
  async.parallel(ops, callback);
}

/**
 * Loads metadata from the existing Project.
 *
 * @param {Function} callback A Node-style callback to be called with either an
 * Error or the Project instance.
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

    self.getModules(function (err, modules) {
      self.modules = modules;
      callback(null, self);
    });
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
 * Retrieves all the Modules in the Project.
 *
 * @param {Function} callback A Node-style callback to be called with either an Error or an Array of Module names.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.getModules = getModules;
function getModules(callback) {
  var self = this;
  var root = path.join(self.root, 'modules');

  fs.readdir(root, function (err, fragments) {
    if (err) {
      callback(err);
      return;
    }

    async.filter(fragments, function (fragment, cbIsModule) {
      Project.isModule(path.join(root, fragment), cbIsModule);
    }, function (names) {
      callback(null, names);
    });
  });

  return self;
}

/**
 * Retrieves the metadata for a single Module instance.
 */
Project.prototype.getModule = getModule;
function getModule(dir, callback) {
  var self = this;

  // TODO(schoon) - Load full module content? How does editing work?
  fs.readFile(path.join(self.root, 'modules', dir, 'module.json'), 'utf8', function (err, json) {
    if (err) {
      callback(err);
      return;
    }

    try {
      callback(null, JSON.parse(json));
    } catch (e) {
      callback(e);
      return;
    }
  });

  return self;
}

/**
 * Adds a new instance of `factory` as a Module at `dir`.
 *
 * @param {String} type The type of factory to use for rendering the new Module instance.
 * @param {String} dir The directory within `modules` to place the new Module in.
 * @param {Object} options The options to use while rendering the Module instance.
 * @param {Function} callback An error-only callback.
 * @returns {Project} The Project instance, for cascading.
 */
Project.prototype.addModule = addModule;
function addModule(type, dir, options, callback) {
  var self = this;
  var factory = ModuleFactory.factory(
    type, path.join(self.root, 'modules', dir)
  );

  assert(factory, 'Factory of type ' + type + ' was not found');

  async.waterfall([
    function (cbCreate) {
      factory.create(options, function (err) {
        if(err) {
          cbCreate(err);
        } else {
          cbCreate();
        }
      });
    },
    fs.readFile.bind(fs, path.join(self.root, 'package.json'), 'utf8'),
    function (json, cbMerge) {
      // TODO(ritch) - waterfall needs reworking so an empty JSON file isn't written
      if(!json.replace(' ', '')) {
        return cbMerge();
      }
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
    description: self.description,
    modules: self.modules
  };
}

/*!
 * Export `Project`.
 */
module.exports = Project;
