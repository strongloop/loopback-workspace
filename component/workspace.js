'use strict';
const Graph = require('./datamodel/graph');
const Processor = require('./datamodel/util/processor');
const Tasks = require('./tasks.js');

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
    //mixin the atomic tasks with the workspace graph
    mixin(this, Tasks.prototype);
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
  getModel(modelId) {
    const model = this.getNode('ModelDefinition', modelId);
    return model;
  }
  getDataSource(id) {
    const ds = this.getNode('DataSource', id);
    return ds;
  }
  getModelProperty(id) {
    const property = this.getNode('ModelProperty', id);
    return property;
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
