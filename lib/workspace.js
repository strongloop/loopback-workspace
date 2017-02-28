'use strict';
const config = require('./config.json');
const DataSource = require('../datamodel/datasource');
const Graph = require('../datamodel/graph');
const clone = require('lodash').clone;
const Model = require('../datamodel/model');
const MiddlewarePhase = require('../datamodel/middleware-phase');
const lodash = require('lodash');
const path = require('path');
const Processor = require('./util/processor');
const Tasks = require('./tasks');

/**
 * @class Workspace
 *
 * Graph which acts as an in-memory data model of the workspace.
 * It represents all the artifacts as nodes and relation between the artifacts as links.
 */
class Workspace extends Graph {

  constructor(rootFolder) {
    super();
    this.directory = rootFolder;
    this.processor = new Processor();
    // mixin the atomic tasks with the workspace graph
    mixin(this, Tasks.prototype);
    this.middlewarePhases = [];
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
  getFacets() {
    return this._cache['Facet'];
  }
  getFacet(name) {
    const facet = this.getNode('Facet', name);
    return facet;
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
  getModel(modelId) {
    const model = this.getNode('ModelDefinition', modelId);
    return model;
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
  getAllModels() {
    const models = this._cache['ModelDefinition'];
    return models;
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
  getModelProperty(id) {
    const property = this.getNode('ModelProperty', id);
    return property;
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
      let middlewareList = phase.getMiddlewareList();
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
          let middleware = phase.getMiddleware(middlewareName);
          if (middleware) {
            middleware.setConfig(middlewareConfig);
          } else {
            phase.addMiddleware(workspace, middlewareName, middlewareConfig);
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
