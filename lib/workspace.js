'use strict';
const config = require('./config.json');
const Container = require('./datamodel/graph').Container;
const DataSource = require('./datamodel/datasource');
const clone = require('lodash').clone;
const Facet = require('./datamodel/facet');
const Model = require('./datamodel/model');
const mixin = require('./util/mixin');
const Middleware = require('./datamodel/middleware');
const MiddlewarePhase = require('./datamodel/middleware-phase');
const lodash = require('lodash');
const PackageDefinition = require('./datamodel/package-definition');
const path = require('path');
const Processor = require('./util/processor');

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
    this.middlewarePhases = [];
    this.events = {};
    this.contains(Model, 'models');
    this.contains(MiddlewarePhase, 'phases');
    this.contains(Facet, 'facets');
    this.contains(PackageDefinition);
    config.builtInModels.forEach(function(name) {
      let model =
        new Model(this, 'loopback.models.' + name, {}, {builtIn: true});
      this.add(model);
    }, this);
    config.middlewarePhases.forEach(function(phaseName) {
      const phaseArr = [phaseName + ':before', phaseName, phaseName + ':after'];
      phaseArr.forEach(function(phase) {
        this.middlewarePhases.push(phase);
        let middlewarePhase = new MiddlewarePhase(this, phase);
        this.add(middlewarePhase);
      }, this);
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
  execute(transaction, options, callBack) {
    const workspace = this;
    if (typeof options === 'function') {
      callBack = options;
      options = {};
    }
    var task = this.processor.createTask(callBack);
    if (options.refresh) {
      if (options.refresh.models)
        task.addFunction(workspace.refreshModels);
    }
    transaction.forEach(function(t) {
      task.addFunction(t);
    });
    this.processor.emit('execute', task);
  }
  getDirectory() {
    return this.directory;
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
  getMiddlewarePhase(phaseName) {
    return this.getNode('MiddlewarePhase', phaseName);
  }
  getMiddlewareConfig() {
    const phases = this.middlewarePhases;
    const config = {};
    for (let index = 0; index < phases.length; index++) {
      let phaseName = phases[index];
      let phase = this.phases(phaseName);
      let middlewareList = phase.middlewares().nodes;
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
      let phase = workspace.phases(phaseName);
      if (phase) {
        let middlewareList = config[phaseName];
        Object.keys(middlewareList).forEach(function(middlewareName) {
          let middlewareConfig = middlewareList[middlewareName];
          let middleware = phase.middlewares(middlewareName);
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

module.exports = Workspace;
