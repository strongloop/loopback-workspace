/**
 * Expose `ProjectConfig`.
 */

module.exports = ProjectConfig;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , Module = require('module')
  , asteroid = require('asteroid')
  , debug = require('debug')('project-config')
  , util = require('util')
  , inherits = util.inherits
  , path = require('path')
  , assert = require('assert')
  , _ = require('underscore');
  
/**
 * Create a new `ProjectConfig` with the given `options`.
 *
 * @param {Object} options
 * @return {ProjectConfig}
 */

function ProjectConfig(configData, dir, projectRoot, moduleConfigData) {
  EventEmitter.apply(this, arguments);
  
  this._data = configData;

  this.isProjectRoot = projectRoot === dir;
  this.projectRoot = projectRoot;
  
  if(this.isProjectRoot) {
    // project root
  } else if(moduleConfigData) {
    this.dir = dir;
    assert(moduleConfigData, 'module config requires config.json');
    
    this.name = path.basename(dir);
    
    var moduleLoader = this.moduleLoader = asteroid.configure.createModuleLoader(projectRoot);
    
    this.module = this.loadModuleType(moduleConfigData.module);
    
    this.options = moduleConfigData.options;
    this._dependencies = moduleConfigData.dependencies;
  } else {
    throw new Error('cannot construct project config for ' + dir);
  }
  
  debug('created with data', configData);
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(ProjectConfig, EventEmitter);

/**
 * Get the absolute path from a relative module path.
 */

ProjectConfig.prototype.absoluteModulePath = function (modulePath) {
  return path.join(this.projectRoot, modulePath || this.dir, 'config.json');
}

ProjectConfig.prototype.normalDir = function () {
  return this.dir.split(path.sep).join('/');
}

/**
 * Get a ProjectConfig by path.
 */

ProjectConfig.prototype.get = function (modulePath) {
  var data = this._data[this.absoluteModulePath(modulePath)];
  
  if(data) {
    return new ProjectConfig(this._data, modulePath, this.projectRoot, data);
  }
}

/**
 * Get a ProjectConfig by name and type.
 */

ProjectConfig.prototype.getPathByNameAndType = function (name, type) {
  var data = this._data;
  var paths = Object.keys(data);
  
  for(var i = 0; i < paths.length; i++) {
    var cpath = paths[i];
    var config = data[cpath];
    var moduleName = path.basename(path.dirname(cpath));
    
    if(name === moduleName && type === config.module) {
      return path.dirname(path.relative(this.projectRoot, cpath));
    }
  }
}

/**
 * Get the base module class for the current object.
 */

ProjectConfig.prototype.baseModule = function () {
  var chain = this.inheritanceChain();
  
  return chain[chain.length - 1];
}

/**
 * Get the inheritence chain for the current object or the object for the provided dir.
 */

ProjectConfig.prototype.inheritanceChain = function (dir) {
  var module;
  var chain = [];
  
  if(dir) {
    module = this.get(dir).module;
  } else {
    module = this.module;
  }
  
  if(this.isProjectRoot) {
    return [];
  }
  
  assert(module, 'module class not found when trying to build inheritance chain for ' + module);
  
  var ctor = module;
  
  while(ctor) {
    chain.push(ctor.name);
    ctor = ctor.super_;
  }
  
  return chain;
}

/**
 * Build a dependency tree from the current object.
 */

ProjectConfig.prototype.dependencies = function () {
  var deps = this._dependencies || {};
  
  var result = Object 
    .keys(deps)
    .reduce(function (result, type) {
      result[type] = this.get(this.getPathByNameAndType(deps[type], type));
      return result;
    }.bind(this), {});
  
  return result || {};
}

ProjectConfig.prototype.dependencyList = function() {
  return _(this.dependencies()).chain().map(function(dep, key) {
    return dep;
  }).sortBy('name').value();
};

ProjectConfig.prototype.dependents = function() {
  var self = this;

  var result = _.chain(this._data).map(function(d, k) {
    var dirname = path.relative(self.projectRoot, path.dirname(k));
    return new ProjectConfig(self._data, dirname, self.projectRoot, d);
  }).filter(function(c) {

    return _(c.dependencyList()).some(function(d) {
      return self.name === d.name;
    });

  }).value();

  return result;

};

ProjectConfig.prototype.loadModuleType = function (name) {
  var Type = this.moduleLoader.loadType(name);
  var self = this;
  var deps = Type.dependencies;
  
  // bind dependencies function
  function getDependencyModules() {
    var result;

    if(deps) {
      result = Object 
        .keys(deps)
        .reduce(function (result, key) {
          result[key] = self.loadModuleType(key);
          return result;
        }, {});
    } else {
      result = {};
    }

    return result;
  }
  
  return {
    options: Type.options,
    dependenciesDefinition: deps,
    name: Type.moduleName,
    dependencies: getDependencyModules
  };
}

ProjectConfig.prototype.toJSON = function () {
  var json = {
    name: this.name,
    baseModule: this.baseModule(),
    dependencies: this.dependencies(),
    dir: this.dir,
    inheritanceChain: this.inheritanceChain()
  };
  
  if(this.module) {
    json.module = {
      name: this.module.name,
      dependencies: this.module.dependencies(),
    };
  }
  
  return this
    // only include children of this config
    .children()
    // reduce into an object keyed by dir
    .reduce(function (result, config) {
      result[config.dir] = config.toJSON();
      return result;
    }, json);
}

ProjectConfig.prototype.children = function () {
  var data = this._data;
  var keys = Object.keys(data);
  var dir = this.isProjectRoot ? this.projectRoot : this.dir;
  var projectRoot = this.projectRoot;
  var self = this;
  
  return keys
    // only include children of the current dir
    .filter(function (p) {
      if(p.indexOf(dir) === 0) {
        return true;
      }
    })
    // map paths into actual config objects
    .map(function (p) {
      var modulePath = path.relative(dir, path.dirname(p));
      return self.get(modulePath);
    });
}