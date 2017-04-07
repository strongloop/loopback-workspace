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
    this.events = {};
    this.contains(Model, 'models');
    this.contains(Facet, 'facets');
    this.contains(PackageDefinition);
    config.builtInModels.forEach(function(name) {
      let model =
        new Model(this, 'loopback.models.' + name, {}, {builtIn: true});
      this.add(model);
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
};

module.exports = Workspace;
