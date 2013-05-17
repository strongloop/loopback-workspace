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
  , assert = require('assert')
  , _ = require('underscore')
  , mkdirp = require('mkdirp');
  
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

Project.prototype.filesTree = function(fn) {
  var self = this;
  self.getConfig(function(err, config) {
    if (err) return fn(err);
    self.files(function(err, files) {
      if (err) return fn(err);

      // TODO: Optimize
      var treeHash = {};

      _(files).each(function(stat, filePath) {
        var parts = filePath.split(path.sep),
            currentNode = treeHash,
            currentPart,
            currentPath;
        while ((currentPart = parts.shift())) { // double parens to make jshint happy
          if (currentPath) {
            currentPath += "/" + currentPart;
          } else {
            currentPath = currentPart;
          }

          if (!currentNode[currentPart]) {
            var file = {
              name: currentPart,
              normalDir: currentPath
            };
            if (currentPart === 'config.json') {
              file.obj = config.get(path.dirname(filePath));
            }
            currentNode[currentPart] = file;
          }

          if (parts.length) {
            if (!currentNode[currentPart].children) {
              currentNode[currentPart].children = {};  
            }

            currentNode = currentNode[currentPart].children;
          }
        }
      });

      var fileTree = treeHashToArray(treeHash);
      fn(null, fileTree);

    });
  });
};

Project.prototype.dependencyTree = function(fn) {
  // TODO: Optimize
  this.getConfig(function(err, config) {
    if (err) return fn(err);

    var dependedKeys = {},
        configs = [],
        result = [];

    // First pass: recursively find all objects in the project, noting which ones are depended on
    function scanTree(config) {
      config.children().forEach(function(c) {
        configs.push(c);
        _(c.dependencies()).each(function(dep, type) {
          dependedKeys[dep.name] = true;
        });
        scanTree(c);
      });
    }

    scanTree(config);

    // Second pass: copy all top-level objects to the result
    result = _.chain(configs).filter(function(c) {
      return !dependedKeys[c.name];
    }).sortBy('name').value();

    fn(null, result);

  });
};

Project.prototype.getConfigByType = function(fn) {
  this.getConfig(function(err, config) {
    if (err) return fn(err);

    var types = {};

    function scanTree(config) {
      config.children().forEach(function(c) {
        var base = c.baseModule();

        if (!types[base]) {
          types[base] = [];
        }

        types[base].push(c);

        scanTree(c);
      });
    }
    scanTree(config);

    fn(null, _.chain(types).map(function(objs, key) {
      return {
        name: key,
        children: _(objs).sortBy('name')
      };
    }).sortBy('name').value());

  });
};

Project.prototype.getObjectsOfType = function(type, fn) {
  this.getConfig(function(err, config) {
    if (err) return fn(err);

    var objects = [];

    function scanTree(config) {
      config.children().forEach(function(c) {

        if (_(c.inheritanceChain()).contains(type)) {
          objects.push(c);
        }

        scanTree(c);
      });
    }

    scanTree(config);

    objects = _(objects).sortBy('name');

    fn(null, objects);

  });
}

function treeHashToArray(treeHash, options) {
  options = _.defaults(options || {}, {
    childrenProperty: 'children'
  });
  var childrenProperty = options.childrenProperty;
  return _(treeHash).chain().map(function(value, key) {
    if (value[childrenProperty]) {
      value[childrenProperty] = treeHashToArray(value[childrenProperty], options);
    }
    return value;
  }).sortBy(function(file) { return file.name }) // Sort alphabetically...
    .sortBy(function(file) { return file[childrenProperty] ? false : true }) // But folders go first
    .value();    
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

Project.prototype.createObject = function(name, options, fn) {
  var te = new TaskEmitter();
  var project = this;
  var objPath = path.join(this.dir, name);
  var objConfig;

  te
    .task('mkdirp', mkdirp, objPath)
    .on('mkdirp', function() {
      var content = JSON.stringify(options, null, '  ');
      te.task(fs, 'writeFile', path.join(objPath, 'config.json'), content);
    })
    .on('writeFile', function() {
      var cl = ConfigLoader.create(project.dir, {ttl: 0});
      te.task(cl, 'load');
    })
    .on('load', function(config) {
      objConfig = new ProjectConfig(config, objPath, project.dir, options);
    })
    .on('error', function(err) {
      fn(err);
    })
    .on('done', function() {
      fn(null, objConfig);
    });
};