'use strict';
const config = require('./config.json');
const Container = require('./datamodel/graph').Container;
const DataSource = require('./datamodel/datasource');
const clone = require('lodash').clone;
const Facet = require('./datamodel/facet');
const Model = require('./datamodel/model');
const Middleware = require('./datamodel/middleware');
const MiddlewarePhase = require('./datamodel/middleware-phase');
const lodash = require('lodash');
const PackageDefinition = require('./datamodel/package-definition');
const path = require('path');
const Processor = require('./util/processor');
const Tasks = require('./tasks');

/**
 * @class Workspace
 *
 * Graph which acts as an in-memory data model of the workspace.
 * It represents all the artifacts as nodes and relation between the artifacts as links.
 */
class Workspace extends Container {

  constructor(rootFolder) {
    super();
    this.directory = rootFolder;
    this.processor = new Processor();
    // mixin the atomic tasks with the workspace graph
    mixin(this, Tasks.prototype);
    this.middlewarePhases = [];
    this.events = {};
    this.contains(Model);
    this.contains(MiddlewarePhase);
    this.contains(Facet);
    this.contains(DataSource);
    this.contains(PackageDefinition);
  }
  addBuiltInModels(list) {
    list.forEach(function(name) {
      // add ModelDefinition to the workspace graph for a builtin loopback model
      new Model(this, name, {}, {builtIn: true});
    }, this);
  }
  getConfig() {
    return config;
  }
  setId(id) {
    this.id = id;
  }
  getId() {
    return this.id;
  }
  execute(transaction, callBack) {
    var task = this.processor.createTask(callBack);
    transaction.forEach(function(t) {
      task.addFunction(t);
    });
    this.processor.emit('execute', task);
  }
  getDirectory() {
    return this.directory;
  }
  getDataSourceConfigFilePath() {
    const workspace = this;
    const filePath = path.join(workspace.directory, 'server',
      config.DataSourceConfigFile);
    return filePath;
  }
  getMiddlewareFilePath() {
    const workspace = this;
    const filePath = path.join(workspace.directory, 'server',
      config.DefaultMiddlewareFile);
    return filePath;
  }
  getModelDefinitionPath(facetName, modelName) {
    const filePath = path.join(this.directory, facetName,
      config.ModelDefaultDir, lodash.kebabCase(modelName) + '.json');
    return filePath;
  }
  createModelDefinition(id, modelDef) {
    const modelData = clone(modelDef);
    delete modelData['properties'];
    delete modelData['methods'];
    delete modelData['relations'];
    delete modelData['validations'];
    delete modelData['acls'];
    // new Model node is created and added to workspace
    new Model(this, id, modelData);
  }
  getDataSource(id) {
    const ds = this.getNode('DataSource', id);
    return ds;
  }
  getAllDataSourceConfig() {
    const dsList = this.getAllDataSources();
    const config = [];
    Object.keys(dsList).forEach(function(key) {
      let datasource = dsList[key];
      if (datasource) {
        config.push(datasource.getDefinition());
      }
    });
    return config;
  }
  getAllDataSources() {
    const ds = this._cache['DataSource'];
    return ds;
  }
  setDatasources(config) {
    const workspace = this;
    const datasources = this._cache['DataSource'];
    Object.keys(config).forEach(function(key) {
      let ds = datasources['server.' + key];
      if (ds) {
        ds._content = config[key];
      } else {
        new DataSource(workspace, key, config[key]);
      }
    });
  }
  getMiddlewarePhase(phaseName) {
    return this.getNode('MiddlewarePhase', phaseName);
  }
  getMiddlewareConfig() {
    const phases = this.middlewarePhases;
    const config = {};
    for (let index = 0; index < phases.length; index++) {
      let phaseName = phases[index];
      let phase = this.getMiddlewarePhase(phaseName);
      let middlewareList = phase.middleware().nodes;
      if (middlewareList) {
        config[phase._name] = {};
        Object.keys(middlewareList).forEach(function(middlewareName) {
          let middleware = middlewareList[middlewareName];
          let functionName = middleware.getFunction();
          config[phase._name][functionName] = middleware.getConfig();
        });
      }
    }
    return config;
  }
  setMiddlewareConfig(config) {
    const workspace = this;
    Object.keys(config).forEach(function(phaseName) {
      let phase = workspace.getMiddlewarePhase(phaseName);
      if (phase) {
        let middlewareList = config[phaseName];
        Object.keys(middlewareList).forEach(function(middlewareName) {
          let middlewareConfig = middlewareList[middlewareName];
          let middleware = phase.middleware(middlewareName);
          if (middleware) {
            middleware.setConfig(middlewareConfig);
          } else {
            middleware =
              new Middleware(workspace, middlewareName, middlewareConfig);
            phase.add(middleware);
          }
        });
      }
    });
  }
  setMiddlewarePhase(phaseName) {
    const workspace = this;
    const phaseArr = [phaseName + ':before', phaseName, phaseName + ':after'];
    phaseArr.forEach(function(phase) {
      this.middlewarePhases.push(phase);
      new MiddlewarePhase(this, phase);
    }, this);
  }
  setFacetConfig(facetName, facetConfig) {
    const workspace = this;
    const facet = workspace.getFacet(facetName);
    facet.setConfig(facetConfig);
  }
  registerEvent(event, handler) {
    const parts = event.split('.');
    const domain = parts[0];
    const action = parts[1];
    this.events[domain] = this.events[domain] || {};
    this.events[domain][action] = this.wrapHandler(handler);
  }
  wrapHandler(handler) {
    const workspace = this;
    return function() {
      const args = Array.prototype.slice.call(arguments);
      const cb = args.pop();
      const method = function(next) {
        args.push(next);
        handler.apply(workspace, args);
      };
      const tasks = [];
      tasks.push(method);
      workspace.execute(tasks, cb);
    };
  }
};

function mixin(target, source) {
  const attributes = Object.getOwnPropertyNames(source);
  attributes.forEach(function(ix) {
    if (typeof source[ix] === 'function') {
      const mx = source[ix];
      target[ix] = mx;
    }
  });
}

module.exports = Workspace;
