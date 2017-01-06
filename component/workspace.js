'use strict';
const config = require('./config.json');
const Graph = require('./datamodel/graph');
const clone = require('lodash').clone;
const Model = require('./datamodel/model');
const MiddlewarePhase = require('./datamodel/middleware-phase');
const path = require('path');
const Processor = require('./datamodel/util/processor');
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
  addBuiltInModel(name) {
    // add ModelDefinition to the workspace graph for a builtin loopback model
    new Model(this, name, {}, {builtIn: true});
  }
  getConfig() {
    return config;
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
      config.ModelDefaultDir, modelName + '.json');
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
  getAllDataSources() {
    const ds = this._cache['DataSource'];
    return ds;
  }
  setDatasources(config) {
    const datasources = this._cache['DataSource'];
    Object.keys(datasources).forEach(function(key) {
      let ds = datasources[key];
      ds._content = config[key];
    });
  }
  getModelProperty(id) {
    const property = this.getNode('ModelProperty', id);
    return property;
  }
  addMiddlewarePhase(phaseName) {
    new MiddlewarePhase(this, phaseName + ':before');
    new MiddlewarePhase(this, phaseName);
    new MiddlewarePhase(this, phaseName + ':after');
    this.middlewarePhases.push(phaseName);
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
      config[phase._name] = {};
      Object.keys(middlewareList).forEach(function(middlewareName) {
        let middleware = middlewareList[middlewareName];
        let functionName = middleware.getFunction();
        config[phase._name][functionName] = middleware.getConfig();
      });
    }
    return config;
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
